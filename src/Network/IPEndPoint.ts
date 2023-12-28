export class IPEndPoint {
    host: string;
    port: number;

    constructor(host: string, port: number = 0) {
        if (port == 0) {
            const strs = host.split(":");
            this.host = strs[0];
            this.port = parseInt(strs[1]);
        } else {
            this.host = host;
            this.port = port;
        }
    }

    toString() {
        return `${this.host}:${this.port}`;
    }
}