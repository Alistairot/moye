import { RecycleObj } from "../Core/Core";
import { WaitError } from "./WaitError";

export class AWait extends RecycleObj {
    error: WaitError = WaitError.SUCCESS;
}