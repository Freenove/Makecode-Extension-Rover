music.beginMelody(music.builtInMelody(Melodies.PowerUp), MelodyOptions.Once)
Rover.setBrightness(255)
Rover.setRGBLED(Rover.ledIndex(LEDIndex.LED1), Rover.showColor(0xff0000))
basic.pause(1000)
Rover.setReceiveString("" + Rover.order_export(Orders.MOVE) + "#" + "255" + "#" + "255" + "#")
if (Rover.checkOrder(Orders.MOVE)) {
    Rover.MotorRunDual(Rover.getParameter(0), Rover.getParameter(1))
    basic.pause(1000)
    Rover.Move(-255)
    basic.pause(1000)
    Rover.MotorStopAll(MotorActions.Stop)
} else {
    Rover.MotorStopAll(MotorActions.Stop)
}
basic.showNumber(Rover.Ultrasonic())
basic.showNumber(Rover.LineTracking())
basic.showNumber(Rover.LightTracing())
basic.showNumber(Rover.BatteryLevel())
basic.forever(function () {
    Rover.setALLRGB(Rover.hsl(input.runningTime() / 10 % 360, 99, 50))
})
