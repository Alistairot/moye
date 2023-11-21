import { IPipelineItem, PipelineMgr, Proto2Ts } from "Proto2Ts"

class ParserPipeline implements IPipelineItem {
    run(content: string): string {
        let needReplace = `import { MessageParserDecorator } from "cocos-node";`
        let replaceValue = 'import { MessageParserDecorator } from "../../../../../common/Message/MessageParserDecorator";';
        let str = content.replace(needReplace, replaceValue)

        return str
    }
}

class DeclarePipeline implements IPipelineItem {
    run(content: string): string {
        let needReplace = `import { IMessage, IRequest, IResponse, MessageDecorator, ResponseTypeDecorator} from 'cocos-node';`
        let replaceValue = `import { MessageDecorator } from '../../../../../common/Message/MessageDecorator';\n`
            + `import { IRequest, IResponse, IMessage } from '../../../../../common/Message/IMessage';\n`
            + `import { ResponseTypeDecorator } from '../../../../../common/Message/ResponseTypeDecorator';`;

        let str = content.replace(needReplace, replaceValue)

        return str
    }
}


export class ServerGenerator{
    static run(){
        PipelineMgr.inst.reset();
        PipelineMgr.inst.insertParser(new ParserPipeline());
        PipelineMgr.inst.insertDeclare(new DeclarePipeline());
        
        Proto2Ts.run({
            writePath: 'src/server/src/Game/Message/InnerMessageCore/',
            namespace: 'InnerMessageCore',
            startOpcode: 1000,
            protoFilePath: 'proto/InnerMessageCore.proto'
        })

        Proto2Ts.run({
            writePath: 'src/server/src/Game/Message/OuterMessageCore/',
            namespace: 'OuterMessageCore',
            startOpcode: 2000,
            protoFilePath: 'proto/OuterMessageCore.proto'
        })
    }
}