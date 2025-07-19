#include <Arduino.h>  // Assure la compatibilité si tu utilises PlatformIO ou autres

// Définition des broches pour les moteurs
const int IN1 = 26;    // Moteur gauche
const int IN2 = 27;
const int IN3 = 14;    // Moteur droit
const int IN4 = 12; 
const int ENA = 18;    // Enable moteur gauche (PWM)
const int ENB = 19;    // Enable moteur droit (PWM)

// Définition des broches pour les ultrasons
const int trigPinRight = 16;   
const int echoPinRight = 4;
const int trigPinLeft = 13;
const int echoPinLeft = 32;

// Paramètres de vitesse réduite
const int SPEED_FORWARD = 200;
const int SPEED_TURN = 255;
const int SPEED_BACKWARD = 120;  // Vitesse pour reculer

// Seuil de distance pour détection d'obstacle
const int OBSTACLE_DISTANCE = 25;

// Variables pour mouvement continu
unsigned long lastActionTime = 0;
int currentAction = 0; // 0=stop, 1=forward, 2=turnLeft, 3=turnRight, 4=backward
bool isBackingUp = false;
unsigned long backupStartTime = 0;

// Fonction qui mesure la distance
long getDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  return duration == 0 ? 400 : duration * 0.0343 / 2;
}

// Fonction pour arrêter les moteurs (utilisée seulement au setup)
void stopMotors() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
}

// Fonction pour avancer (continue)
void moveForward() {
  if (currentAction != 1) {
    Serial.println("AVANCE CONTINU");
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, HIGH);
    analogWrite(ENA, SPEED_FORWARD);
    analogWrite(ENB, SPEED_FORWARD);
    currentAction = 1;
  }
}

// Fonction pour reculer (continue)
void moveBackward() {
  if (currentAction != 4) {
    Serial.println("RECULE CONTINU");
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    digitalWrite(IN3, HIGH);
    digitalWrite(IN4, LOW);
    analogWrite(ENA, SPEED_BACKWARD);
    analogWrite(ENB, SPEED_BACKWARD);
    currentAction = 4;
  }
}

// Fonction pour tourner à gauche (continue)
void turnLeft() {
  if (currentAction != 2) {
    Serial.println("VIRAGE GAUCHE CONTINU");
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, LOW);
    analogWrite(ENA, SPEED_TURN);
    analogWrite(ENB, 0);
    currentAction = 2;
  }
}

// Fonction pour tourner à droite (continue)
void turnRight() {
  if (currentAction != 3) {
    Serial.println("VIRAGE DROITE CONTINU");
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    digitalWrite(IN3, LOW);
    digitalWrite(IN4, HIGH);
    analogWrite(ENA, 0);
    analogWrite(ENB, SPEED_TURN);
    currentAction = 3;
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(ENA, OUTPUT);
  pinMode(ENB, OUTPUT);

  pinMode(trigPinRight, OUTPUT);
  pinMode(echoPinRight, INPUT);
  pinMode(trigPinLeft, OUTPUT);
  pinMode(echoPinLeft, INPUT);
 
  randomSeed(analogRead(0));  // Pour les virages aléatoires
  stopMotors();
  Serial.println("Robot démarré - MOUVEMENT CONTINU activé!");
}

void loop() {
  unsigned long currentTime = millis();
  long distanceRight = getDistance(trigPinRight, echoPinRight);
  long distanceLeft = getDistance(trigPinLeft, echoPinLeft);

  // Gestion du recul temporaire (sans delay bloquant)
  if (isBackingUp) {
    if (currentTime - backupStartTime > 500) { // 500ms de recul
      isBackingUp = false;
      Serial.println("Fin du recul - reprend navigation");
    } else {
      moveBackward();
      return; // Continue le recul
    }
  }

  // Logique principale - MOUVEMENT CONTINU SANS STOPS
  if (distanceRight > OBSTACLE_DISTANCE && distanceLeft > OBSTACLE_DISTANCE) {
    // Chemin libre - avancer en continu
    moveForward();
  } 
  else if (distanceRight < OBSTACLE_DISTANCE && distanceLeft < OBSTACLE_DISTANCE) {
    // Bloqué des deux côtés - déclencher recul automatique
    if (!isBackingUp) {
      isBackingUp = true;
      backupStartTime = currentTime;
      Serial.println("BLOQUÉ - Recul automatique puis virage droite");
    }
  } 
  else {
    // Obstacle d'un côté - tourner en continu vers le côté libre
    if (distanceRight > distanceLeft) {
      turnRight();  // Tourne à droite en continu
    } else {
      turnLeft();   // Tourne à gauche en continu
    }
  }

  // Debug périodique non-bloquant (toutes les 200ms)
  if (currentTime - lastActionTime > 200) {
    Serial.print("Distances - G:");
    Serial.print(distanceLeft);
    Serial.print("cm | D:");
    Serial.print(distanceRight);
    Serial.print("cm | Action: ");
    Serial.println(currentAction == 1 ? "AVANCE" : 
                   currentAction == 2 ? "VIRAGE_G" : 
                   currentAction == 3 ? "VIRAGE_D" : 
                   currentAction == 4 ? "RECULE" : "STOP");
    lastActionTime = currentTime;
  }

  delay(20); // Délai minimal pour réactivité
}