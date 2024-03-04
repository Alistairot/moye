import { Type } from "../Core/Core";

export class LocalStorageHelper {
    static getNumber(key: string, defaultValue: number): number {
        const item = localStorage.getItem(key);

        if (!item) {
            return defaultValue;
        }

        try {
            return Number(item);
        } catch (e) {
            return defaultValue;
        }
    }

    static setNumber(key: string, value: number) {
        localStorage.setItem(key, value.toString());
    }

    static getString(key: string, defaultValue: string): string {
        const item = localStorage.getItem(key);

        if (!item) {
            return defaultValue;
        }

        return item;
    }

    static setString(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    static setBoolean(key: string, value: boolean) {
        localStorage.setItem(key, value ? '1' : '0');
    }

    static getBoolean(key: string, defaultValue: boolean): boolean {
        const item = localStorage.getItem(key);

        if (!item) {
            return defaultValue;
        }

        return item == '1';
    }

    static setObject(value: object) {
        localStorage.setItem(value.constructor.name, JSON.stringify(value));
    }

    static getObject<T>(obj: Type<T>): T | null {
        const item = localStorage.getItem(obj.name);

        if (!item) {
            return null;
        }

        try {
            return JSON.parse(item);
        } catch (e) {
            return null;
        }
    }
}