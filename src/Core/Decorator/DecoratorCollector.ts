export class DecoratorCollector {
    private static _inst: DecoratorCollector;
    public static get inst(): DecoratorCollector {
        if (DecoratorCollector._inst == null) {
            DecoratorCollector._inst = new DecoratorCollector;
        }

        return DecoratorCollector._inst;
    }

    private _decorators: Map<string, any> = new Map;

    public add(decoratorType: string, ...args) {
        let array = this._decorators.get(decoratorType);

        if (!array) {
            array = [];
            this._decorators.set(decoratorType, array);
        }

        array.push(args);
    }

    public get(decoratorType: string): Array<any> {
        const array = this._decorators.get(decoratorType);

        return array || [];
    }
}