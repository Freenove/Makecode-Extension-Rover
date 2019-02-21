/**
 * Freenove Micro : Rover.
 */
/**
 * RoverColors: Some common colors
 */
enum RoverColors {
    //% block=red
    Red = 0xFF0000,
    //% block=orange
    Orange = 0xFFA500,
    //% block=yellow
    Yellow = 0xFFFF00,
    //% block=green
    Green = 0x00FF00,
    //% block=blue
    Blue = 0x0000FF,
    //% block=indigo
    Indigo = 0x4b0082,
    //% block=violet
    Violet = 0x8a2be2,
    //% block=purple
    Purple = 0xFF00FF,
    //% block=white
    White = 0xFFFFFF,
    //% block=black
    Black = 0x000000
}
/**
 * Orders: Command parameter
 */
enum Orders {
    MOVE = 0,
    STOP = 1,
    ORDER_RGB = 2,
    BUZZER = 3,
    DISTANCE = 4,
    LIGHTING = 5,
    TRACKING = 6,
    MODE = 7,
    VOLTAGE = 8,
    ECHO_OK = 9,
    NONE = 10
}
/**
 * LEDIndex: LED Index Combination Value
 */
enum LEDIndex {
    LED1 = 1,
    LED2 = 2,
    LED3 = 4,
    LED4 = 8,
    LED1_2 = 3,
    LED1_3 = 5,
    LED1_4 = 9,
    LED2_3 = 6,
    LED2_4 = 10,
    LED3_4 = 12,
    LED1_2_3 = 7,
    LED1_2_4 = 11,
    LED1_3_4 = 13,
    LED2_3_4 = 14,
    LED_All = 15
}
/**
 * RoverModes: Rover's working mode
 */
enum RoverModes {
    Mode_None = 0,
    Mode_ObstacleAvoidance = 1,
    Mode_LightTracing = 2,
    Mode_LineTracking = 3,
    Mode_Remote = 4
}
/**
 * MotorActions: Stop or Brake
 */
enum MotorActions {
    Stop = 1,
    Brake = 2
}
/**
 * Rover: blocks 
 */
//% color="#FF0000" weight=10 icon="\uf1b9"
//% groups="['LEDs','Motors','Sensors','Commands']"
namespace Rover {
    const PCA9685_ADDRESS = 0x43;
    const MODE1 = 0x00;
    const MODE2 = 0x01;
    const SUBADR1 = 0x02;
    const SUBADR2 = 0x03;
    const SUBADR3 = 0x04;
    const PRESCALE = 0xFE;
    const LED0_ON_L = 0x06;
    const LED0_ON_H = 0x07;
    const LED0_OFF_L = 0x08;
    const LED0_OFF_H = 0x09;
    const ALL_LED_ON_L = 0xFA;
    const ALL_LED_ON_H = 0xFB;
    const ALL_LED_OFF_L = 0xFC;
    const ALL_LED_OFF_H = 0xFD;

    const TRIG_PIN = DigitalPin.P12;
    const ECHO_PIN = DigitalPin.P13;
    /**
     * Class RGB: Control the color and brightness of RGB LED
     */
    class RGB {
        redPin: number;
        greenPin: number;
        bluePin: number;
        color: number;
        /**
         * Pins number connected to LED.
         * @param _redPin red pin number.
         * @param _greenPin green pin number.
         * @param _bluePin blue  pin number.
         */
        constructor(_redPin: number, _greenPin: number, _bluePin: number) {
            this.redPin = _redPin;
            this.greenPin = _greenPin;
            this.bluePin = _bluePin;
            this.color = 0;
            if (!is_PCA9685_Initialized) {
                init_PCA9685()
            }
        }
        /**
         * set leds color 
         * @param ccolor , the color rgb value 
         */
        setColor(ccolor: number): void {
            this.color = ccolor;
            let blue = ccolor & 0xFF;
            let green = ccolor >> 8 & 0xFF;
            let red = ccolor >> 16 & 0xFF;
            if (brightness < 255) {
                red = red * brightness >> 8;
                green = green * brightness >> 8;
                blue = blue * brightness >> 8;
            }
            setPwm(this.redPin, 0, red * 16)
            setPwm(this.greenPin, 0, green * 16)
            setPwm(this.bluePin, 0, blue * 16)
        }
        /**
         * refresh leds.
         */
        refresh(): void {
            this.setColor(this.color)
        }
    }
    /**
     * Fixed pin number, determined by hardware.
     */
    let leds1 = new RGB(14, 15, 13);
    let leds2 = new RGB(5, 6, 4);
    let leds3 = new RGB(8, 9, 7);
    let leds4 = new RGB(11, 12, 10);
    /**
     * define the motor index.
     */
    export enum Motors {
        M1 = 0x1,
        M2 = 0x2
    }

    let ordersAyyay = "ABCDEFGHIJK";
    let is_PCA9685_Initialized = false;
    let lastEchoDuration = 0;
    let brightness = 255;
    let currentOrder = "K";
    let parameterList: string[] = []
    let realMode = 0;
    /**
     * the function of i2c_write
     * @param addr the address of i2c device
     * @param reg  the register of i2c device
     * @param value Values to be written
     */
    function i2cWrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = value;
        pins.i2cWriteBuffer(addr, buf);
    }

    function i2cRead(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }
    /**
     * set pwm frequence.
     * @param freq frequence: 40 ~ 1000.
     */
    function setFreq(freq: number): void {
        // Constrain the frequency
        freq = Math.constrain(freq, 40, 1000);
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cRead(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cWrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cWrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }
    /**
     * Initialize the PCA9685.
     */
    function init_PCA9685(): void {
        i2cWrite(PCA9685_ADDRESS, MODE1, 0x00);
        setFreq(1000);
        for (let idx = 0; idx < 16; idx++) {
            setPwm(idx, 0, 0);
        }
        is_PCA9685_Initialized = true;
    }
    /**
     * Setting the duty cycle of PWM for pin.
     * @param channel the channel of pca9685, 0 ~ 15.
     * @param on high level point, 0 ~ 4095
     * @param off low level point, 0 ~ 4095
     */
    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }
    /**
     * Set all leds brightness.
     * @param br the brightness value, 0 ~ 255.
     */
    //% blockId=rover_setBrightness block="Brightness %br"
    //% weight=200
    //% br.min=0 br.max=255
    //% br.defl=255
    //% color=#FFA500
    //% group="LEDs"
    export function setBrightness(br: number): void {
        brightness = br;
        leds1.refresh();
        leds2.refresh();
        leds3.refresh();
        leds4.refresh();
    }
    /**
     * export the leds index.
     * @param index the leds index.
     */
    //% blockId="rover_led_index" block="%index"
    //% weight=185  
    //% advanced=true
    //% color=#FF0000
    //% group="LEDs"    
    export function ledIndex(index: LEDIndex): number {
        return index;
    }
    /**
     * setting the color of leds.
     * @param index the index of leds.
     * @param ccolor rgb value of color
     */
    //% blockId=rover_setRGBLED block="%index=rover_led_index show %ccolor=rover_colors"
    //% weight=195
    //% color=#FFA500
    //% group="LEDs"
    export function setRGBLED(index: number, ccolor: number): void {
        index = Math.constrain(index, 0, 15);
        if ((index & 0x01) == 0x01) {
            leds1.setColor(ccolor);
        }
        if ((index & 0x02) == 0x02) {
            leds2.setColor(ccolor);
        }
        if ((index & 0x04) == 0x04) {
            leds3.setColor(ccolor);
        }
        if ((index & 0x08) == 0x08) {
            leds4.setColor(ccolor);
        }
    }
    /**
     * setting the color of all leds.
     * @param ccolor rgb value of color
     */
    //% blockId=rover_setAllRGB block="All LED show %ccolor=rover_colors"
    //% weight=190
    //% group="LEDs"
    //% color=#FFA500
    export function setALLRGB(ccolor: number): void {
        setRGBLED(LEDIndex.LED_All, ccolor);
    }
    /**
     * Gets the RGB value of a known color
    */
    //% blockId="rover_colors" block="%color"
    //% weight=185  
    //% advanced=true
    //% group="LEDs"
    //% color=#FF0000
    export function colors(color: RoverColors): number {
        return color;
    }
    /**
     * Gets the RGB value of a known color
    */
    //% block="%color"
    //% color.shadow="colorNumberPicker"
    //% weight=180    
    //% group="LEDs"
    //% color=#FFA500
    export function showColor(color: number): number {
        return color;
    }
    /**
     * customize rgb values.
     * @param red red value
     * @param green green value 
     * @param blue blue value
     */
    //% blockId=rover_rgb block="red%red | green%green | blue%blue"
    //% weight=165
    //% red.min=0 red.max=255
    //% green.min=0 green.max=255
    //% blue.min=0 blue.max=255
    //% red.defl=128
    //% green.defl=128
    //% blue.defl=128
    //% advanced=true
    //% group="LEDs"
    //% color=#FFA500
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }
    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    /**
     * Converts a hue saturation luminosity value into a RGB color
     * @param h hue from 0 to 360
     * @param s saturation from 0 to 99
     * @param l luminosity from 0 to 99
     */
    //% blockId=rover_HSL block="hue %h|saturation %s|luminosity %l"
    //% weight=164
    //% h.min=0 h.max=360
    //% s.min=0 s.max=99
    //% l.min=0 l.max=99
    //% h.defl=0
    //% s.defl=99
    //% l.defl=50
    //% group="LEDs"
    //% color=#FFA500
    export function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }
    /**
     * Running a motor at a specified speed.
     * @param index the index of the motor.
     * @param speed the speed of the motor.
     */
    //% blockId=rover_MotorRun block="Motor|%index|speed %speed"
    //% weight=80
    //% speed.min=-255 speed.max=255
    //% speed.defl=50
    //% advanced=true
    //% group="Motors"
    //% color=#222222
    export function MotorRun(index: Motors, speed: number): void {
        speed = Math.map(speed, -255, 255, -4095, 4095);
        speed = Math.constrain(speed, -4095, 4095);
        let pp = (index - 1) * 2
        let pn = (index - 1) * 2 + 1
        if (index == Motors.M2) {
            speed = -speed
        }
        if (speed >= 0) {
            setPwm(pp, 0, speed)
            setPwm(pn, 0, 0)
        } else {
            setPwm(pp, 0, 0)
            setPwm(pn, 0, -speed)
        }
    }
    /**
     * Braking a motor.
     * @param index the index of the motor.
     */
    function brakeMotor(index: Motors) {
        setPwm((index - 1) * 2, 0, 4095);
        setPwm((index - 1) * 2 + 1, 0, 4095);
    }

    /**
     * Running two motors at the same time
     * @param speed1 [-255-255] speed of motor; eg: 150, -150
     * @param speed2 [-255-255] speed of motor; eg: 150, -150
    */
    //% blockId=rover_motor_dual block="Speed left %speed1|right %speed2"
    //% weight=90
    //% speed1.min=-255 speed1.max=255
    //% speed2.min=-255 speed2.max=255
    //% speed1.defl=50
    //% speed2.defl=50
    //% group="Motors"
    //% color=#222222
    export function MotorRunDual(speed1: number, speed2: number): void {
        MotorRun(Motors.M1, speed1);
        MotorRun(Motors.M2, speed2);
    }
    /**
     * Running two motors at the same speed.
     * @param speed speed of motors.
     */
    //% blockId=rover_move_forward block="Move speed %speed"
    //% weight=95
    //% speed.min=-255 speed.max=255
    //% speed.defl=50
    //% group="Motors"
    //% color=#222222
    export function Move(speed: number): void {
        MotorRunDual(speed, speed);
    }
    /**
     * Stop or Brake a motor.
     * @param act Stop or Brake.
     * @param index the index of the motor.
     */
    //% blockId=rover_stop block="%act=MotorActions motor|%index|"
    //% weight=75
    //% advanced=true
    //% group="Motors"
    //% color=#222222
    export function MotorStop(act: MotorActions, index: Motors): void {
        if (act == MotorActions.Stop) {
            MotorRun(index, 0);
        }
        else if (act == MotorActions.Brake) {
            brakeMotor(index);
        }
    }
    /**
     * Stop or Brake all motor.
     * @param act Stop or Brake.
     */
    //% blockId=rover_stop_all block="%act=MotorActions all motors"
    //% weight=70
    //% group="Motors"
    //% color=#222222
    export function MotorStopAll(act: MotorActions): void {
        if (act == MotorActions.Stop) {
            MotorRun(Motors.M1, 0);
            MotorRun(Motors.M2, 0);
        }
        else if (act == MotorActions.Brake) {
            brakeMotor(Motors.M1);
            brakeMotor(Motors.M2);
        }
    }
    /**
     * Export the distance measured by the ultrasonic module.
     */
    //% blockId=rover_ultrasonic block="distance"
    //% weight=65
    //% group="Sensors"
    //% color=#FF00F0
    export function Ultrasonic(): number {

        //send trig pulse
        pins.setPull(TRIG_PIN, PinPullMode.PullNone);
        pins.digitalWritePin(TRIG_PIN, 0)
        control.waitMicros(2);
        pins.digitalWritePin(TRIG_PIN, 1)
        control.waitMicros(10);
        pins.digitalWritePin(TRIG_PIN, 0)

        // read echo pulse  max distance : 6m  
        let t = pins.pulseIn(ECHO_PIN, PulseValue.High, 35000);
        let ret = t;

        if (ret == 0 && lastEchoDuration != 0) {
            ret = lastEchoDuration;
        }
        lastEchoDuration = t;
        return Math.round(ret * 10 / 6 / 58);
    }
    /**
     * Export value of line-tracking sensor.
     */
    //% blockId=rover_line_tracking block="line-tracking value"
    //% weight=65
    //% group="Sensors"
    //% color=#FF00F0
    export function LineTracking(): number {
        let val = pins.digitalReadPin(DigitalPin.P14) << 2 | pins.digitalReadPin(DigitalPin.P15) << 1 | pins.digitalReadPin(DigitalPin.P16) << 0;
        return val;
    }
    /**
     * Export value of light-tracing sensor.
     */
    //% blockId=rover_light_tracing block="light-tracing value"
    //% weight=65
    //% group="Sensors"
    //% color=#FF00F0
    export function LightTracing(): number {
        let val = pins.analogReadPin(AnalogPin.P1)
        return val;
    }
    /**
     * Export battery voltage value.
     */
    //% blockId=rover_bettery_level block="battery voltage"
    //% weight=60
    //% group="Sensors"
    //% color=#FF00F0
    export function BatteryLevel(): number {
        let p2_adc = pins.analogReadPin(AnalogPin.P2);
        let bat_valotage = Math.round(p2_adc * 6.4516);     //unit: mV ,6.4516 = ~ 2*3.3/1023
        return bat_valotage;
    }
    /**
     * Set command strings and parse commands and parameters.
     * @param receivedString String to parse.
     */
    //% blockId=rover_set_receive_string block="Set CMD to %receivedString"
    //% weight=55
    //% advanced=true
    //% group="Commands"
    //% color=#0000FF
    export function setReceiveString(receivedString: string): void {
        parameterList = []
        let interval = receivedString.indexOf("#")
        while (interval >= 0) {
            let parameter = receivedString.substr(0, interval)
            parameterList.push(parameter)
            receivedString = receivedString.substr(interval + 1, receivedString.length - interval - 1)
            interval = receivedString.indexOf("#")
        }
        currentOrder = parameterList.shift()
    }
    /**
     * Export parsed CMD<order>.
     */
    //% blockId=rover_get_order block="CMD<order>"
    //% weight=53
    //% advanced=true
    //% group="Commands"
    //% color=#0000FF
    export function getOrder(): string {
        return currentOrder
    }
    /**
     * Determine whether the parsed command is a known command.
     * @param _inOrder Known commands.
     */
    //% blockId=rover_check_order block="CMD<order> is %_inOrder"
    //% weight=53
    //% advanced=true
    //% group="Commands"
    //% color=#0000FF
    export function checkOrder(_inOrder: Orders): boolean {
        if (currentOrder == ordersAyyay[_inOrder])
            return true
        else
            return false
    }
    /**
     * Get the parameters in the list.
     * @param index the index of parameter list.
     */
    //% blockId=rover_get_paramter block="CMD<Paramter> at %index"
    //% weight=52
    //% index.min=0 index.max=5
    //% index.defl=0
    //% advanced=true
    //% group="Commands"
    //% color=#0000FF
    export function getParameter(index: number): number {
        return parseFloat(parameterList[index]);
    }
    /**
     * Combining commands and parameters to be sent into strings.
     * @param _inOrder Commands to be sent.
     * @param paramters The parameters to be sent
     */
    //% blockId=rover_send_string block="CMD<order> %_inOrder | CMD<Paramter>%paramters"
    //% weight=51
    //% advanced=true
    //% group="Commands"
    //% color=#0000FF
    export function SendString(_inOrder: Orders, paramters: number): string {
        return ordersAyyay[_inOrder] + "#" + paramters + "#";
    }
    /**
     * Set the working mode of Rover.
     * @param mode Rover's working mode.
     */
    //% blockId=rover_set_rover_mode block="set rover mode to %mode"
    //% weight=51
    //% advanced=true
    //% group="Commands"
    //% color=#0070FF
    export function setRoverMode(mode: number): void {
        realMode = mode;
    }
    /**
     * Determine whether a given mode is a known mode.
     * @param isMode known mode.
     */
    //% blockId=rover_check_mode block="Rover mode is %isMode"
    //% weight=51
    //% advanced=true
    //% group="Commands"
    //% color=#0070FF
    export function checkMode(isMode: RoverModes): boolean {
        if (realMode == isMode)
            return true;
        else
            return false;
    }
    /**
     * Export the order list.
     * @param _inOrder Order list.
     */
    //% blockId=rover_order_export block="%_inOrder"
    //% weight=50
    //% advanced=true
    //% group="Commands"
    //% color=#0070FF
    export function order_export(_inOrder: Orders): string {
        return ordersAyyay[_inOrder];
    }
    /**
     * Export the rover mode list.
     * @param mode known mode list.
     */
    //% blockId=rover_rover_mode_export block="%mode"
    //% weight=50
    //% advanced=true
    //% group="Commands"
    //% color=#0070FF
    export function rover_mode_export(mode: RoverModes): number {
        return mode;
    }
    /**
     * Number of parsed parameters.
     */
    //% blockId=rover_length_of_paramters block="count of paramters"
    //% weight=50
    //% advanced=true
    //% group="Commands"
    //% color=#0070FF
    export function parametersLength(): number {
        return parameterList.length;
    }
    /**
     * String list of parsed parameters.
     */
    //% blockId=rover_paramtersList block="ArrayList<paramters>"
    //% weight=50
    //% advanced=true
    //% group="Commands"
    //% color=#0070FF
    export function parametersList(): string[] {
        return parameterList;
    }

}

