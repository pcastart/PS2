//% weight=9 color="#7BD239" icon="\uf11b"
namespace ps2controller {

    let chipSelect = 0
    let pad = pins.createBuffer(6)
    let connected = false

    /*
    // Unused at the moment
    const config_cmd_enter = hex
        `014300010000000000`
    const config_cmd_exit = hex
        `014300005a5a5a5a5a`
    const config_enable_analog = hex
        `014400010300000000`
    const config_enable_vibration = hex
        `014d000001ffffffff`
    */

    //
    const poll_cmd = hex
        `014200000000000000`


    /**
     * initstall PS2 Receiver Pin
     * @param CLKPin SCK Pin; eg: DigitalPin.P13
     * @param DATPin MISO Pin; eg: DigitalPin.P14
     * @param CMDPin MOSI Pin; eg: DigitalPin.P15
     * @param CSPin  CS Pin; eg: DigitalPin.P16
     */
    //% blockId=ps2_init_pin block="PS2PIN CLK|%CLK|DAT|%DAT|CMD|%CMD|CS %CS"
    //% weight=100
    //% inlineInputMode=inline
    export function initPS2Pin(CLKPin: DigitalPin, DATPin: DigitalPin, CMDPin: DigitalPin, CSPin: DigitalPin) {
        chipSelect = CSPin
        pins.digitalWritePin(chipSelect, 1)
        pins.spiPins(CMDPin, DATPin, CLKPin)

        // chipSelect = DigitalPin.P15
        // pins.digitalWritePin(chipSelect, 1)
        // pins.spiPins(DigitalPin.P14, DigitalPin.P13, DigitalPin.P16)

        pins.spiFormat(8, 3)
        pins.spiFrequency(250000)
    }

    function send_command(transmit: Buffer): Buffer {
        // deal with bit-order
        transmit = rbuffer(transmit)

        let receive = pins.createBuffer(transmit.length);

        pins.digitalWritePin(chipSelect, 0);
        // send actual command
        for (let i = 0; i < transmit.length; i++) {
            receive[i] = pins.spiWrite(transmit[i]);
        }
        pins.digitalWritePin(chipSelect, 1)

        // deal with bit-order
        receive = rbuffer(receive)

        return receive
    }

    export enum PS2Button {
        Select,
        Start,
        Up,
        Down,
        L1,
        R1,
        Left,
        Right,
        L2,
        R2,
        Triangle,
        Cross,
        L3,
        R3,
        Square,
        Circle,
        Buttons
    };

    /**
     * PS2 button pressed
     * @param b ps2 button;
     */
    //% weight=80
    //% block="button pressed %b"
    //% b.fieldEditor="gridpicker" b.fieldOptions.columns=4
    export function button_pressed(b: PS2Button): number {
        if (!connected) return 0x00

        switch (b) {
            case PS2Button.Select:
                return pad[0] & 0x01 ? 0 : 1;
            case PS2Button.L3:
                return pad[0] & 0x02 ? 0 : 1;
            case PS2Button.R3:
                return pad[0] & 0x04 ? 0 : 1;
            case PS2Button.Start:
                return pad[0] & 0x08 ? 0 : 1;
            case PS2Button.Up:
                return pad[0] & 0x10 ? 0 : 1;
            case PS2Button.Right:
                return pad[0] & 0x20 ? 0 : 1;
            case PS2Button.Down:
                return pad[0] & 0x40 ? 0 : 1;
            case PS2Button.Left:
                return pad[0] & 0x80 ? 0 : 1;
            case PS2Button.L2:
                return pad[1] & 0x01 ? 0 : 1;
            case PS2Button.R2:
                return pad[1] & 0x02 ? 0 : 1;
            case PS2Button.L1:
                return pad[1] & 0x04 ? 0 : 1;
            case PS2Button.R1:
                return pad[1] & 0x08 ? 0 : 1;
            case PS2Button.Triangle:
                return pad[1] & 0x10 ? 0 : 1;
            case PS2Button.Circle:
                return pad[1] & 0x20 ? 0 : 1;
            case PS2Button.Cross:
                return pad[1] & 0x40 ? 0 : 1;
            case PS2Button.Square:
                return pad[1] & 0x80 ? 0 : 1;
            case PS2Button.Buttons:
                return ~((pad[1] << 8) | pad[0]) & 0xffff;
        }
        return 0;
    }

    // PS2 stick values
    export enum PSS {
        LX,
        RX,
        LY,
        RY
    };

    /**
    * PS2 stick value
    * @param stick ps2 stick;
    */
    //% weight=70
    //% block="stick value %stick"
    //% stick.fieldEditor="gridpicker" stick.fieldOptions.columns=2
    export function stick_value(stick: PSS): number {
        if (!connected) return 0x00

        switch (stick) {
            case PSS.RX:
                return pad[2] - 0x80;
            case PSS.RY:
                return pad[3] - 0x80;
            case PSS.LX:
                return pad[4] - 0x80;
            case PSS.LY:
                return pad[5] - 0x80;
        }
        return 0;
    }

 
    // basic.forever(function () {
    //     poll();
    // })

  
}