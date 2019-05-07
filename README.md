# Makecode-Extension-Rover

Freenove Micro:Rover Extension for Makecode.

<img src='icon.png' width='30%'/>

## Micro:Rover
* You can buy the Freenove Micro:Rover from here.<br>
    * United States: https://www.amazon.com/dp/B07QV5VS5W
    * United Kingdom: https://www.amazon.co.uk/dp/B07QV5VS5W
    * Germany: https://www.amazon.de/dp/B07QV5VS5W
    * France: https://www.amazon.fr/dp/B07QV5VS5W
    * Italy: https://www.amazon.it/dp/B07QV5VS5W
    * Spain: https://www.amazon.es/dp/B07QV5VS5W
* You can find all the information about it here.<br>
    * https://github.com/Freenove/Freenove_Micro_Rover/
* You can see its demo video here.
    * https://youtu.be/H7P5lZo29lA

## Usage
### LEDs
Function | Description
--- | ---
Rover.setBrightness(255) | Set the brightness of all RGB LEDs on the Rover.
Rover.setRGBLED(Rover.ledIndex(LEDIndex.LED1), <br>Rover.showColor(0xff0000)) | Set specific RGB LED to a specific color.
Rover.setALLRGB(Rover.colors(RoverColors.Red)) | Set all RGB LED to a specific color.
Rover.showColor(0xff0000) | Color palette provides 16 kinds of colors.
Rover.hsl(0, 99, 50) | The HSL color picking model returns the RGB color value.
Rover.ledIndex(LEDIndex.LED1) | RGB LED combination selection list.
Rover.colors(RoverColors.Red) | Common color list provides 10 kinds of colors
Rover.rgb(128, 128, 128) | The RGB color picking model returns the RGB color value.

### Motors
Function | Description
--- | ---
Rover.Move(50) | Set the two motors at the same speed to makes the Rover move forward or backward. <br>The positive value is for forward and the negative value is for backward.
Rover.MotorRunDual(50, 50) | Set the speed of the left and right motors to make the Rover move or turn
Rover.MotorRun(Rover.Motors.M1, 50) | Set the speed of only one motor (M1 or M2).
Rover.MotorStopAll(MotorActions.Stop) | Make two motors stop or brake at the same time.
Rover.MotorStop(MotorActions.Stop, Rover.Motors.M1) | Make only one motor (M1 or M2) stop or brake.

### Sensors
Function | Description
--- | ---
Rover.Ultrasonic() | Start the ultrasonic ranging module and return the measured distance. <br>This block is a time-consuming block. If you use this block multiple times in a short time, <br>you need use a variable to save the returned distance value.
Rover.LineTracking() | Returns the value of the line-tracking Sensor.
Rover.LightTracing() | Returns the value of the light-tracing Sensor.
Rover.BatteryLevel() | Returns the battery voltage value.

### Commands
Function | Description
--- | ---
Rover.setReceiveString("") |  Set CMD as a string and parse it into CMD'order' and CMD'parameters'. And store them in 'Rover.getOrder()' and 'Rover.parametersList()' accordingly.
Rover.getOrder() | Return the parsed command.
Rover.parametersList() | Return an array in which parsed parameters are stored.
Rover.parametersLength() | Returns the number of parsed parameters.
Rover.checkOrder(Orders.MOVE) | bool. Determine whether 'Rover.getOrder()' is the currently specified command.
Rover.getParameter(0)| Gets the specified parameter in the parameter array.
Rover.SendString(Orders.MOVE, 0) | Combine a specified command with a specified parameter. It is used when sending a command.
Rover.setRoverMode(0) | Set a variable to represent the mode of Rover.
Rover.checkMode(RoverModes.Mode_None) | bool. Judge if the Rover mode variable is the specified mode.
Rover.order_export(Orders.MOVE) | Command/action list.
Rover.rover_mode_export(RoverModes.Mode_None) | Rover mode list.

## Examples:

The file test.ts, which uses most of the blocks in this extension and contains almost all the functions that Micro: Rover has. 
<br>Here are some simple examples.

### Show colors
In this example, Rover's four sets of LEDs are bright red, green, blue and yellow, and gradually change from dark to bright.
```
Rover.setRGBLED(Rover.ledIndex(LEDIndex.LED1), Rover.colors(RoverColors.Red))
Rover.setRGBLED(Rover.ledIndex(LEDIndex.LED2), Rover.colors(RoverColors.Green))
Rover.setRGBLED(Rover.ledIndex(LEDIndex.LED3), Rover.colors(RoverColors.Blue))
Rover.setRGBLED(Rover.ledIndex(LEDIndex.LED4), Rover.colors(RoverColors.Yellow))
basic.forever(function () {
    for (let index = 0; index <= 255; index++) {
        Rover.setBrightness(index)
    }
})
```

### Show Sensors values
In this example, the micro:bit in order to show the value of the Rover ultrasonic range sensor, light tracing sensor value, line tracking sensor value, and battery voltage sensor value.
```
basic.forever(function () {
    basic.showNumber(Rover.Ultrasonic())
    basic.showNumber(Rover.LightTracing())
    basic.showNumber(Rover.LineTracking())
    basic.showNumber(Rover.BatteryLevel())
})
```

### Move
In this example, the Rover move in the forward, backward, turn left, turn right, every action for a second.
```
basic.forever(function () {
    Rover.Move(255)
    basic.pause(1000)
    Rover.Move(-255)
    basic.pause(1000)
    Rover.MotorRunDual(-255, 255)
    basic.pause(1000)
    Rover.MotorRunDual(255, -255)
    basic.pause(1000)
})
```
## License

MIT

## Supported targets

* for PXT/microbit

