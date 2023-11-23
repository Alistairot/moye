### use
```ts
// Images is bundle name
MAssets.loadAssetAsync(ImageAsset, 'Images/loading/wait_1').then((res) => {
    console.log(res);
});
MAssets.loadAssetAsync(SpriteFrame, 'Images/toggle_2_1').then((res) => {
    console.log(res);
});
``