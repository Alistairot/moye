import { assetManager, native } from "cc"
import { Task } from "../../../../common/Core/Task/Task"
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper"

export class HttpHelper {
    static fetchJson(url: string): any {
        let task = Task.create()
        try {
            fetch(url).then((response: Response) => {
                return response.json()
            }).then((value) => {
                if (value == null) {
                    task.setResult()
                    return
                }

                task.setResult(value)
            })
        } catch (error) {

        }

        return task
    }

    static download(downloadUrl: string, progressCB?: any) {
        let task = Task.create()

        assetManager.downloader.download(downloadUrl, downloadUrl, '.bin', {}, (err, data) => {
            if (err != null) {
                coreLog('下载失败:{0}', downloadUrl)
                task.setResult()
                return
            }

            if (progressCB != null) {
                progressCB()
            }

            let rawData = native.fileUtils.getDataFromFile(data)

            task.setResult(rawData)
        })

        return task
    }
}