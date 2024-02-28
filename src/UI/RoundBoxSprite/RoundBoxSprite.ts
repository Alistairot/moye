import { _decorator, CCBoolean, CCFloat, CCInteger, cclegacy, InstanceMaterialType, Material, Node, NodeEventType, RenderTexture, Sprite, SpriteAtlas, SpriteFrame, UIRenderer } from 'cc';
import { BUILD, EDITOR } from 'cc/env';
import { RoundBoxAssembler } from './RoundBoxAssembler';

const { ccclass, property, type, menu } = _decorator;

enum EventType {
    SPRITE_FRAME_CHANGED = 'spriteframe-changed',
}

@ccclass('RoundBoxSprite')
@menu('moye/RoundBoxSprite')
export class RoundBoxSprite extends UIRenderer {
    // 尺寸模式，可以看枚举原本定义的地方有注释说明
    @property({ serializable: true })
    protected _sizeMode = Sprite.SizeMode.TRIMMED;
    @type(Sprite.SizeMode)
    get sizeMode() {
        return this._sizeMode;
    }
    set sizeMode(value) {
        if (this._sizeMode === value) {
            return;
        }

        this._sizeMode = value;
        if (value !== Sprite.SizeMode.CUSTOM) {
            this._applySpriteSize();
        }
    }
    /**
     * @en Grayscale mode.
     * @zh 是否以灰度模式渲染。
     */

    @property({ serializable: true })
    protected _useGrayscale = false;

    @property({ type: CCBoolean })
    get grayscale(): boolean {
        return this._useGrayscale;
    }
    set grayscale(value) {
        if (this._useGrayscale === value) {
            return;
        }
        this._useGrayscale = value;
        this.changeMaterialForDefine();
        this["updateMaterial"]();
    }

    // 图集
    @property({ serializable: true })
    protected _atlas: SpriteAtlas | null = null;
    @type(SpriteAtlas)
    get spriteAtlas() {
        return this._atlas;
    }
    set spriteAtlas(value) {
        if (this._atlas === value) {
            return;
        }
        this._atlas = value;
    }
    // 圆角用三角形模拟扇形的线段数量，越大，则越圆滑
    @property({ type: CCInteger, serializable: true })
        _segments: number = 10;
    @property({ type: CCInteger, serializable: true, min: 1 })
    public get segments() {
        return this._segments;
    }
    public set segments(segments) {
        this._segments = segments;
        this._renderData = null;
        this._flushAssembler();
    }
    // 圆角半径
    @property({ type: CCFloat, serializable: true })
        _radius: number = 20;
    @property({ type: CCFloat, serializable: true, min: 0 })
    public get radius() {
        return this._radius;
    }
    public set radius(radius) {
        this._radius = radius;
        this._updateUVs();
        this.markForUpdateRenderData(true);
    }

    @property({ serializable: true })
    protected _spriteFrame: SpriteFrame | null = null;
    @type(SpriteFrame)
    get spriteFrame() {
        return this._spriteFrame;
    }
    set spriteFrame(value) {
        if (this._spriteFrame === value) {
            return;
        }

        const lastSprite = this._spriteFrame;
        this._spriteFrame = value;
        this.markForUpdateRenderData();
        this._applySpriteFrame(lastSprite);
        if (EDITOR) {
            this.node.emit(EventType.SPRITE_FRAME_CHANGED, this);
        }
    }
    @property({ serializable: true })
    protected _leftTop: boolean = true;
    @property({ serializable: true })
    get leftTop() {
        return this._leftTop;
    }
    set leftTop(value: boolean) {
        this._leftTop = value;
        this.resetAssembler();
    }
    @property({ serializable: true })
    protected _rightTop: boolean = true;
    @property({ serializable: true })
    get rightTop() {
        return this._rightTop;
    }
    set rightTop(value: boolean) {
        this._rightTop = value;
        this.resetAssembler();
    }
    @property({ serializable: true })
    protected _leftBottom: boolean = true;
    @property({ serializable: true })
    get leftBottom() {
        return this._leftBottom;
    }
    set leftBottom(value: boolean) {
        this._leftBottom = value;
        this.resetAssembler();
    }
    @property({ serializable: true })
    protected _rightBottom: boolean = true;
    @property({ serializable: true })
    get rightBottom() {
        return this._rightBottom;
    }
    set rightBottom(value: boolean) {
        this._rightBottom = value;
        this.resetAssembler();
    }
    onLoad(): void {
        this._flushAssembler();
    }

    public __preload() {
        this.changeMaterialForDefine();
        super.__preload();

        if (EDITOR) {
            this._resized();
            this.node.on(NodeEventType.SIZE_CHANGED, this._resized, this);
        }
    }

    public onEnable() {
        super.onEnable();

        // Force update uv, material define, active material, etc
        this._activateMaterial();
        const spriteFrame = this._spriteFrame;
        if (spriteFrame) {
            this._updateUVs();
        }
    }

    public onDestroy() {
        if (EDITOR) {
            this.node.off(NodeEventType.SIZE_CHANGED, this._resized, this);
        }
        super.onDestroy();
    }

    /**
     * @en
     * Quickly switch to other sprite frame in the sprite atlas.
     * If there is no atlas, the switch fails.
     *
     * @zh
     * 选取使用精灵图集中的其他精灵。
     * @param name @en Name of the spriteFrame to switch. @zh 要切换的 spriteFrame 名字。
     */
    public changeSpriteFrameFromAtlas(name: string) {
        if (!this._atlas) {
            console.warn('SpriteAtlas is null.');
            return;
        }
        const sprite = this._atlas.getSpriteFrame(name);
        this.spriteFrame = sprite;
    }

    /**
     * @deprecated Since v3.7.0, this is an engine private interface that will be removed in the future.
     */
    public changeMaterialForDefine() {
        let texture;
        const lastInstanceMaterialType = this._instanceMaterialType;
        if (this._spriteFrame) {
            texture = this._spriteFrame.texture;
        }
        let value = false;
        if (texture instanceof cclegacy.TextureBase) {
            const format = texture.getPixelFormat();
            value = (format === cclegacy.TextureBase.PixelFormat.RGBA_ETC1 || format === cclegacy.TextureBase.PixelFormat.RGB_A_PVRTC_4BPPV1 || format === cclegacy.TextureBase.PixelFormat.RGB_A_PVRTC_2BPPV1);
        }

        if (value && this.grayscale) {
            this._instanceMaterialType = InstanceMaterialType.USE_ALPHA_SEPARATED_AND_GRAY;
        } else if (value) {
            this._instanceMaterialType = InstanceMaterialType.USE_ALPHA_SEPARATED;
        } else if (this.grayscale) {
            this._instanceMaterialType = InstanceMaterialType.GRAYSCALE;
        } else {
            this._instanceMaterialType = InstanceMaterialType.ADD_COLOR_AND_TEXTURE;
        }
        if (lastInstanceMaterialType !== this._instanceMaterialType) {
            // this.updateMaterial();
            // d.ts里没有注上这个函数，直接调用会表红。
            this["updateMaterial"]();
        }
    }

    protected _updateBuiltinMaterial() {
        let mat = super._updateBuiltinMaterial();
        if (this.spriteFrame && this.spriteFrame.texture instanceof RenderTexture) {
            const defines = { SAMPLE_FROM_RT: true, ...mat.passes[0].defines };
            const renderMat = new Material();
            renderMat.initialize({
                effectAsset: mat.effectAsset,
                defines,
            });
            mat = renderMat;
        }
        return mat;
    }

    protected _render(render) {
        render.commitComp(this, this.renderData, this._spriteFrame, this._assembler, null);
    }

    protected _canRender() {
        if (!super._canRender()) {
            return false;
        }

        const spriteFrame = this._spriteFrame;
        if (!spriteFrame || !spriteFrame.texture) {
            return false;
        }

        return true;
    }

    protected resetAssembler() {
        this._assembler = null;
        this._flushAssembler();
    }
    protected _flushAssembler() {
        const assembler = RoundBoxAssembler;

        if (this._assembler !== assembler) {
            this.destroyRenderData();
            this._assembler = assembler;
        }


        if (!this._renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this._renderData!.material = this.getRenderMaterial(0);
                this.markForUpdateRenderData();
                if (this.spriteFrame) {
                    this._assembler.updateRenderData(this);
                }
                this._updateColor();
            }
        }
    }

    private _applySpriteSize() {
        if (this._spriteFrame) {
            if (BUILD || !this._spriteFrame.isDefault) {
                if (Sprite.SizeMode.RAW === this._sizeMode) {
                    const size = this._spriteFrame.originalSize;
                    this.node._uiProps.uiTransformComp!.setContentSize(size);
                } else if (Sprite.SizeMode.TRIMMED === this._sizeMode) {
                    const rect = this._spriteFrame.rect;
                    this.node._uiProps.uiTransformComp!.setContentSize(rect.width, rect.height);
                }
            }
            this.markForUpdateRenderData(true);
            this._assembler.updateRenderData(this);
        }
    }

    private _resized() {
        if (!EDITOR) {
            return;
        }

        if (this._spriteFrame) {
            const actualSize = this.node._uiProps.uiTransformComp!.contentSize;
            let expectedW = actualSize.width;
            let expectedH = actualSize.height;
            if (this._sizeMode === Sprite.SizeMode.RAW) {
                const size = this._spriteFrame.originalSize;
                expectedW = size.width;
                expectedH = size.height;
            } else if (this._sizeMode === Sprite.SizeMode.TRIMMED) {
                const rect = this._spriteFrame.rect;
                expectedW = rect.width;
                expectedH = rect.height;
            }

            if (expectedW !== actualSize.width || expectedH !== actualSize.height) {
                this._sizeMode = Sprite.SizeMode.CUSTOM;
            }
        }
    }

    private _activateMaterial() {
        const spriteFrame = this._spriteFrame;
        const material = this.getRenderMaterial(0);
        if (spriteFrame) {
            if (material) {
                this.markForUpdateRenderData();
            }
        }

        if (this.renderData) {
            this.renderData.material = material;
        }
    }

    private _updateUVs() {
        if (this._assembler) {
            this._assembler.updateUVs(this);
        }
    }

    private _applySpriteFrame(oldFrame: SpriteFrame | null) {
        const spriteFrame = this._spriteFrame;

        let textureChanged = false;
        if (spriteFrame) {
            if (!oldFrame || oldFrame.texture !== spriteFrame.texture) {
                textureChanged = true;
            }
            if (textureChanged) {
                if (this.renderData) this.renderData.textureDirty = true;
                this.changeMaterialForDefine();
            }
            this._applySpriteSize();
        }
    }
}