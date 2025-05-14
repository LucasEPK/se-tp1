#include <Arduino_FreeRTOS.h>
// Include semaphore supoport
#include <semphr.h>

/* 
 * Declaring a global variable of type SemaphoreHandle_t 
 * 
 */
SemaphoreHandle_t interruptSemaphore;

int sensorValue = -1;
bool isReadOn = true;

// define two tasks for Blink & AnalogRead
void TaskBlink( void *pvParameters );
void TaskAnalogRead( void *pvParameters );

void TaskPressedButtonChecker( void *pvParameters);

void TaskAlarm( void *pvParameters);

void TaskReceiveInstructions( void *pvParameters);

// the setup function runs once when you press reset or power the board
void setup() {
  
  // initialize serial communication at 9600 bits per second:
  Serial.begin(9600);
  
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB, on LEONARDO, MICRO, YUN, and other 32u4 based boards.
  }

  // Now set up two tasks to run independently.
  xTaskCreate(
    TaskBlink
    ,  "Blink"   // A name just for humans
    ,  84  // This stack size can be checked & adjusted by reading the Stack Highwater
    ,  NULL
    ,  2  // Priority, with 3 (configMAX_PRIORITIES - 1) being the highest, and 0 being the lowest.
    ,  NULL );
  
  xTaskCreate(
    TaskPrintAnalogRead,
    "PrintAnalogRead",
    110,
    NULL,
    2,
    NULL
  );

  xTaskCreate(
    TaskPressedButtonChecker,
    "PressedButtonChecker",
    128,
    NULL,
    2,
    NULL
  );

  xTaskCreate(
    TaskAlarm,
    "Alarm",
    84,
    NULL,
    2,
    NULL
  );
  
  xTaskCreate(
    TaskReceiveInstructions,
    "ReceiveInstructions",
    126, //20 + 18 + 44 + 44
    NULL,
    2,
    NULL
  );

  /**
   * Create a binary semaphore.
   * https://www.freertos.org/xSemaphoreCreateBinary.html
   */
  interruptSemaphore = xSemaphoreCreateBinary();
  if (interruptSemaphore != NULL) {
    // Attach interrupt for Arduino digital pin
    attachInterrupt(digitalPinToInterrupt(2), interruptHandler, FALLING);
  }

  // Now the task scheduler, which takes over control of scheduling individual tasks, is automatically started.
}

void loop()
{
  // Empty. Things are done in Tasks.
}

void interruptHandler() {
  /**
   * Give semaphore in the interrupt handler
   * https://www.freertos.org/a00124.html
   */
  
  xSemaphoreGiveFromISR(interruptSemaphore, NULL);
}

/*--------------------------------------------------*/
/*---------------------- Tasks ---------------------*/
/*--------------------------------------------------*/

/*
  Blink
  Turns on LED 11 on for one second, then off for one second, repeatedly.
  Only if read is on.
*/
void TaskBlink(void *pvParameters)
{
  (void) pvParameters;


  // initialize digital LED_BUILTIN on pin 13 as an output.
  pinMode(11, OUTPUT);

  for (;;) // A Task shall never return or exit.
  {
    if (isReadOn) {
      digitalWrite(11, HIGH);   // turn the LED on (HIGH is the voltage level)
      vTaskDelay( 1000 / portTICK_PERIOD_MS ); // wait for one second
      digitalWrite(11, LOW);    // turn the LED off by making the voltage LOW
      vTaskDelay( 1000 / portTICK_PERIOD_MS ); // wait for one second
    } else {
      vTaskDelay(10);
    }

    /*UBaseType_t stackRemaining = uxTaskGetStackHighWaterMark(NULL);
    Serial.print("stackRemaining (blink): ");
    Serial.println(stackRemaining);*/
  }
}

// Blinks led 12 very fast if luminosity exceeds 800 value and read is on
void TaskAlarm(void *pvParameters)  // This is a task.
{
  (void) pvParameters;

  pinMode(12, OUTPUT);
  
  bool isAlarmActivated = false;

  for (;;) {
    if (sensorValue > 800 && isReadOn == true && isAlarmActivated == false) {
      isAlarmActivated = true;
    }

    if (isAlarmActivated == true) {
      digitalWrite(12, HIGH);   // turn the LED on (HIGH is the voltage level)
      vTaskDelay( 100 / portTICK_PERIOD_MS ); // wait for one second
      digitalWrite(12, LOW);    // turn the LED off by making the voltage LOW
      vTaskDelay( 100 / portTICK_PERIOD_MS ); // wait for one second
    } else {
      vTaskDelay(10);
    }

    if (isReadOn == false && isAlarmActivated == true){
      isAlarmActivated = false;
    }

    /*UBaseType_t stackRemaining = uxTaskGetStackHighWaterMark(NULL);
    Serial.print("stackRemaining (alarm): ");
    Serial.println(stackRemaining);*/
  }
}

// Prints analog read output as a string with a certain format to be read by backend
void TaskPrintAnalogRead(void *pvParameters) {
  (void) pvParameters;

  for (;;) {
    if (isReadOn) {
      // read the input on analog pin 3:
      sensorValue = analogRead(A3);

      char luminosityBuffer[5];
      sprintf(luminosityBuffer, "%04d", sensorValue);
      Serial.println("luminosity: " + String(luminosityBuffer));
      vTaskDelay( 3000 / portTICK_PERIOD_MS ); // wait for three second    
    } else {
      vTaskDelay( 1000 / portTICK_PERIOD_MS ); // for some reason this makes isReadOn update
    }
    Serial.println("isReadOn: " + String(isReadOn));
    /*
    UBaseType_t stackRemaining = uxTaskGetStackHighWaterMark(NULL);
    Serial.print("stackRemaining (analogRead): ");
    Serial.println(stackRemaining);*/
  }
}

// Task that activates on interruption (button 2 pressed), it turns off read
void TaskPressedButtonChecker(void *pvParameters) {
  (void) pvParameters;

  for (;;) {
    /**
    * Take the semaphore.
    * https://www.freertos.org/a00122.html
    */
    if (xSemaphoreTake(interruptSemaphore, portMAX_DELAY) == pdPASS) {
      
      
      isReadOn = !isReadOn;
      //Serial.println("semaphore taken, isReadOn: " + String(isReadOn));
      Serial.println("isReadOn: " + String(isReadOn));
      vTaskDelay( 3000 / portTICK_PERIOD_MS ); // wait for three seconds    
    } else {
      vTaskDelay(10);
    }
    
    /*UBaseType_t stackRemaining = uxTaskGetStackHighWaterMark(NULL);
    Serial.print("stackRemaining (button pressed): ");
    Serial.println(stackRemaining);*/
  }
}

// Reads from serial and if it reads a t turns on read, if it reads an f it turns it off
void TaskReceiveInstructions( void *pvParameters) {
  (void) pvParameters;

  char buffer;


  for (;;) {
    if (Serial.available()>0) {

      buffer = (char)Serial.read();
      Serial.print("Buffer: ");
      Serial.println(buffer);

      if (buffer == 'f') {
        isReadOn = false;
      } else if (buffer == 't') {
        isReadOn = true;
      }
    }
    /*
    UBaseType_t stackRemaining = uxTaskGetStackHighWaterMark(NULL);
    Serial.print("stackRemaining (receiveInstructions): ");
    Serial.println(stackRemaining);*/
    vTaskDelay(10);
  }
}