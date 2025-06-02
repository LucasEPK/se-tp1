
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(A3, INPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  handleInput(receiveInput());
}

void calculate_accumulated_lux_in_minute() {
  int accumulated_lux = 0;
  Serial.println("calculating lux per minute...");
  for (int i=0; i < 60; i++){
    accumulated_lux += analogRead(A3);
    delay(1000); // 1 second delay
  }
  Serial.print("accumulated_lux in a minute:");
  Serial.println(accumulated_lux);
}

String receiveInput() {
  String string_recibido;
  if (Serial.available()>0) {
    string_recibido = Serial.readStringUntil('\n');
  }
  return string_recibido;
}

void handleInput(String input) {
  if (input == "calculate lux per minute"){
    calculate_accumulated_lux_in_minute();
  }
}
