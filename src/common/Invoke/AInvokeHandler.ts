export abstract class AInvokeHandler<A, B> {
    public abstract handle(args?: A): B;
}