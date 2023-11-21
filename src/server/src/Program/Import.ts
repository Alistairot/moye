/**
 * 引用一下框架的内部消息 协议 还有扩展等
 * 不然导出的时候会被裁剪掉
 */

import "../../../common/Entity/Scene";
import "../Game/Message/InnerMessageCore/InnerMessageCoreParser";
import "../Game/Message/OuterMessageCore/OuterMessageCoreParser";
import "../Game/Scene/Gate/C2G_LoginGateHandler";
import "../Game/Scene/Gate/C2G_PingHandler";
import "../Game/Scene/Gate/R2G_GetLoginKeyHandler";
import "../Game/Scene/Map/G2M_ConnectUnitHandler";
import "../Game/Scene/Map/G2M_ConnectUnitHandler";
import "../Game/Scene/Map/G2M_DisconnectUnitHandler";
import "../Game/Scene/Map/M2M_UnitTransferRequestHandler";
import "../Game/Scene/Realm/C2R_LoginHandler";
import "../Module/ActorLocation/Handler/ObjectAddRequestHandler";
import "../Module/ActorLocation/Handler/ObjectGetRequestHandler";
import "../Module/ActorLocation/Handler/ObjectLockRequestHandler";
import "../Module/ActorLocation/Handler/ObjectRemoveRequestHandler";
import "../Module/ActorLocation/Handler/ObjectUnLockRequestHandler";
import "../Module/DB/MessageHandler/DBCacheRequestHandler";
import "../Module/DB/MessageHandler/DBDeleteRequestHandler";
import "../Module/DB/MessageHandler/DBQueryRequestHandler";
import "../Module/Message/InnerMessage/Handlers/ActorMessageHandler";
import "../Module/Message/InnerMessage/Handlers/ActorRequestHandler";
import "../Module/Message/InnerMessage/Handlers/ActorResponseHandler";
import "../Module/Message/OuterMessage/Handlers/ActorLocationMessageHandler";
import "../Module/Message/OuterMessage/Handlers/ActorLocationReqMsgHandler";
import "../Module/Message/OuterMessage/Handlers/GeneralMsgHandler";