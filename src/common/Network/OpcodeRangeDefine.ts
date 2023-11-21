export class OpcodeRangeDefine {
    public static readonly OuterMinOpcode = 10001;
    public static readonly OuterMaxOpcode = 20000;

    // 20001-30000 内网pb
    public static readonly InnerMinOpcode = 20001;
    public static readonly InnerMaxOpcode = 40000;

    public static readonly MaxOpcode = 60000;

    static isOuterMessage(opcode: number): boolean {
        return opcode < this.OuterMaxOpcode;
    }

    static isInnerMessage(opcode: number): boolean {
        return opcode >= this.InnerMinOpcode;
    }
}