export class DecoratorCollector {
    private static _inst: DecoratorCollector
    public static get inst(): DecoratorCollector {
        if (DecoratorCollector._inst == null) {
            DecoratorCollector._inst = new DecoratorCollector
        }

        return DecoratorCollector._inst
    }

    private decorators: Map<string, any> = new Map

    public add(decoratorType: string, ...args) {
        let array = this.decorators.get(decoratorType)

        if (!array) {
            array = new Array
            this.decorators.set(decoratorType, array)
        }

        array.push(args)
    }

    public get(decoratorType: string): Array<any> {
        let array = this.decorators.get(decoratorType)

        return array || []
    }
}