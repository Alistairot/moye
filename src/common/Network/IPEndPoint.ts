export class IPEndPoint {
    public host: string
    public port: number

    constructor(host: string, port: number = 0) {
        if (port == 0) {
            let strs = host.split(":")
            this.host = strs[0]
            this.port = parseInt(strs[1])
        } else {
            this.host = host
            this.port = port
        }
    }

    public toString() {
        return `${this.host}:${this.port}`
    }
}