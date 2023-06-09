{ "header": {"name": "API", "order": 3}, "order": 0 }
---
# LitElement

## class LitElement

コンポーネントのプロパティ(properties)と属性(attributes)を取り扱い、lit-htmlテンプレートをレンダリングするコンポーネントのベースクラスです。
コンポーネントは`LitElement`のサブクラスである必要があります。また、コンポーネントのテンプレートを返す`render`メソッドを実装する必要があります。
プロパティは`properties`プロパティもしくは`property`デコレータを使って定義します。

### Import

```
import { LitElement } from 'lit'
```

### Attributes

#### attributeChangedCallback(name: string, _old: string | null, value: string | null): void

属性が変更された時、プロパティの値を同期します。
具体的に言うと、属性がセットされるとそれに対応するプロパティの値はセットされます。
このメソッドをオーバーライドする場合、`super.attributeChangedCallback(name, _old, value)`を実行する必要があります。
`attributeChangedCallback`に関する詳しい内容はMDNの[Using the lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks)にあります。

#### static observedAttributes: Array<string>

登録されたプロパティに対応する属性のリストを返します。

### Controllers

#### addController(controller: [ReactiveController](https://lit.dev/docs/api/controllers/#ReactiveController)): void

要素の[リアクティブアップデートサイクル](https://japanese-document.github.io/lit/components-lifecycle.html#リアクティブアップデートサイクル)をフックする`ReactiveController`を登録します。
要素はライフサイクルのコールバックで登録したコントローラを自動的に呼び出します。

#### removeController(controller: [ReactiveController](https://lit.dev/docs/api/controllers/#ReactiveController)): void

要素から`ReactiveController`を削除します。

### Dev mode

#### static disableWarning?: (warningKind: [WarningKind](https://lit.dev/docs/api/misc/#WarningKind)) => void

指定した警告カテゴリーを無効にします。
このメソッドはdevelopmentビルドにのみ存在するので、下記のように使用する必要があります。

```
// すべてのReactiveElementのサブクラスで無効にします。
ReactiveElement.disableWarning?.('migration');

// MyElementとそのサブクラスのみで無効にします。
MyElement.disableWarning?.('migration');
```

#### static enabledWarnings?: Array<[WarningKind](https://lit.dev/docs/api/misc/#WarningKind)>

警告カテゴリーが格納されています。
developmentビルドでのみ使うことができます。

#### static enableWarning?: (warningKind: [WarningKind](https://lit.dev/docs/api/misc/#WarningKind)) => void

指定した警告カテゴリーを有効にします。
このメソッドはdevelopmentビルドにのみ存在するので、下記のように使用する必要があります。

```
// すべてのReactiveElementのサブクラスで有効にします。
ReactiveElement.enableWarning?.('migration');

// MyElementとそのサブクラスのみで有効にします。
MyElement.enableWarning?.('migration');
```

### Lifecycle

#### connectedCallback(): void

要素がdocumentのDOMに追加された時に実行されます。
`connectedCallback()`には要素がdocumentに追加された際に必要な処理のみ実装するべきです。
それらで最も一般的なことは、windowにkeydownイベントを追加するような要素の外にあるNodeにイベントリスナを追加することです。

```
connectedCallback() {
  super.connectedCallback();
  window.addEventListener('keydown', this._handleKeydown);
}
```

たいてい、`connectedCallback()`で加えた変更は要素が削除される時に`disconnectedCallback()`で元に戻す必要があります。

#### disconnectedCallback(): void

要素がdocumentのDOMに削除された時に実行されます。
このコールバックは要素が使用されなくなるかもしれないことを示す合図です。
`disconnectedCallback()`ではガベージコレクションがうまくいくように外部の要素への参照(要素の外部に追加されたイベントリスナ等)を削除する必要があります。

```
disconnectedCallback() {
  super.disconnectedCallback();
  window.removeEventListener('keydown', this._handleKeydown);
}
```

要素はDOMから削除された後、追加されることがあります。

### その他 

#### static addInitializer(initializer: [Initializer](https://lit.dev/docs/api/misc/#Initializer)): void

インスタンス生成時に実行されるイニシャライザ(initializer)をクラスに追加します。
`ReactiveElement`のサブクラスに対して実行されるコードでデコレータのように`ReactiveController`のセットアップのようなインスタンスごとに処理する必要がある場合に便利です。

```
const myDecorator = (target: typeof ReactiveElement, key: string) => {
  target.addInitializer((instance: ReactiveElement) => {
    // 要素の生成時に実行します。
    new MyController(instance);
  });
}
```

フィールドにデコレータを追加すると、インスタンス毎でコントローラを追加するイニシャライザが実行されます。

```
class MyElement extends LitElement {
  @myDecorator foo;
}
```

イニシャライザはコンストラクタ毎に格納されます。
サブクラスにイニシャライザを追加してもスーパークラスには追加されません。
イニシャライザはコンストラクタで実行されるので、クラス階層で実行されます。
それはスーパークラスかインスタンスのクラスの順番で実行されます。

#### static finalize(): boolean

登録したプロパティのプロパティアクセサを作成します。
そして、要素のスタイルを設定します。
スーパークラスに対しても同様の処理を行います。
この処理を実行した場合はtrueを返します。

#### static finalized: boolean

`finalize()`を実行していた場合、trueを返します。
このプロパティ名はClosure JS Compilerの最適化を壊さないように文字列にしています。
詳しくは`@lit/reactive-element`を見てください。

### Properties

#### static createProperty(name: PropertyKey, options?: [PropertyDeclaration](https://lit.dev/docs/api/ReactiveElement/#PropertyDeclaration)<unknown, unknown>): void

要素の`prototype`にプロパティアクセサ(`name`)が存在していない場合、プロパティ(`name`)を追加して`options`を格納します。
プロパティのセッターは更新時に[options.hasChanged()](https://japanese-document.github.io/lit/components-properties.html#hasChanged)を実行して更新を判断します。
[options.hasChanged()](https://japanese-document.github.io/lit/components-properties.html#hasChanged)がない場合、参照の比較(`!==`)で判断します。
このメソッドをオーバーライドすると、プロパティの生成を変更することができます。
その場合、`super.createProperty()`を実行する必要があります。
このメソッドは使用するディスクリプタ(descriptor)を取得するために内部で`getPropertyDescriptor()`を使います。
プロパティが取得またはセットされる動作を変更するには`getPropertyDescriptor()`をオーバーライドします。
プロパティのオプションを変更するには下記のように実装します。

```
static createProperty(name, options) {
  options = Object.assign(options, {myOption: true});
  super.createProperty(name, options);
}
```

#### static elementProperties: PropertyDeclarationMap

スーパークラスを含むすべての要素プロパティのメモ化されたリストです。
それはクラスが完成させる(finalize)時にサブクラスで遅延的に生成されます。

#### static getPropertyDescriptor(name: PropertyKey, key: string | symbol, options: [PropertyDeclaration](https://lit.dev/docs/api/ReactiveElement/#PropertyDeclaration)<unknown, unknown>): undefined | PropertyDescriptor

`name`プロパティに対応するディスクリプタ(descriptor)を返します。
ディスクリプタを返さない場合、そのプロパティはアクセサになりません。

```
class MyElement extends LitElement {
  static getPropertyDescriptor(name, key, options) {
    const defaultDescriptor =
        super.getPropertyDescriptor(name, key, options);
    const setter = defaultDescriptor.set;
    return {
      get: defaultDescriptor.get,
      set(value) {
        setter.call(this, value);
        // 何か動作を追加する。
      },
      configurable: true,
      enumerable: true
    }
  }
}
```

#### static getPropertyOptions(name: PropertyKey): [PropertyDeclaration](https://lit.dev/docs/api/ReactiveElement/#PropertyDeclaration)<unknown, unknown>

渡された`name`プロパティに関連した[プロパティオプション](https://japanese-document.github.io/lit/components-properties.html#プロパティオプション)を返します。
このオプションは`properties`や`@property`で`PropertyDeclaration`として定義されています。
それから、`createProperty(...)`で登録されます。
このメソッドは「final」と見なさなければなりません。
だから、オーバーライドしてはいけません。
プロパティのオプションを変更する処理を加えたい場合、`createProperty`をオーバーライドします。

#### static properties: [PropertyDeclarations](https://lit.dev/docs/api/ReactiveElement/#PropertyDeclarations)

[リアクティブプロパティ](https://japanese-document.github.io/lit/components-properties.html)を構成するマップです。
それのキーはプロパティ名です。
値はプロパティオプション(`PropertyDeclaration`)です。
リアクティブプロパティに値をセットすると、要素が更新されてレンダリングされます。
デフォルトではプロパティはパブリックフィールドです。
だから、要素の属性やプロパティ変更することでコンポーネントのプロパティを変更することができます。
`state: true`を[プロパティオプション](https://japanese-document.github.io/lit/components-properties.html#プロパティオプション)にセットする、
もしくは、[state](https://lit.dev/docs/api/decorators/#state)デコレータをセットすると要素の対応する属性をコンポーネントのプロパティに反映しません。

### Rendering

#### createRenderRoot(): [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) | [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)

#### render(): unknown

更新毎にレンダリングタスクを実行するために実行されます。
このメソッドはlit-htmlの`ChildPart`でレンダリング可能な任意の値(通常、`TemplateResult`)を返すことが多いです。
このメソッド内でプロパティをセットしても更新は発動されません。

#### readonly renderOptions: [RenderOptions](#RenderOptions)

#### renderRoot(): [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) | [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)

DOMがレンダリングされるNodeもしくはShadowRootです。
デフォルトは`open`なShadowRootです。

#### static shadowRootOptions: [ShadowRootInit](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#parameters)

`attachShadow`を実行する時に使われるオプションです。
このプロパティはShadowRootのオプションを変更するためにあります。
(`{mode: 'closed'}`とするとShadowRootは[closed](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode)になります。)
このオプションは`createRenderRoot`で使われます。
`createRenderRoot`を変更する場合、できるだけこのオプションを適用するべきです。

### Styles

#### static elementStyles: Array<[CSSResultOrNative](https://lit.dev/docs/api/styles/#CSSResultOrNative)>

すべての要素のスタイルのメモ化されたリストです。
クラスを`finalize`するときにサブクラスで遅延的に生成されます。

#### static finalizeStyles(styles?: [CSSResultGroup](https://lit.dev/docs/api/styles/#CSSResultGroup)): Array<[CSSResultOrNative](https://lit.dev/docs/api/styles/#CSSResultOrNative)>

`static styles`にセットされた値を引数(`styles`)にして、要素に適用するスタイルの配列を返します。
このメソッドをオーバーライドしてスタイル管理システムに統合します。
[サブクラスを積み重ねていくこと](https://japanese-document.github.io/lit/components-styles.html#スーパークラスのスタイルを継承する)で`static styles`に重複が生じする可能性があります。
それを防ぐために、ここで`styles`は末尾に格納されている値を優先的に残す方法で重複が削除されます。
`styles`は末尾に格納されている値が優先的に要素に適用されます。

#### static styles?: [CSSResultGroup](https://lit.dev/docs/api/styles/#CSSResultGroup)

要素に適用されるスタイルの配列です。
スタイルは[css](https://lit.dev/docs/api/styles/#css)タグ関数もしくは[Constructable Stylesheets](https://wicg.github.io/construct-stylesheets/)を使って定義するか、
[CSS Module Scripts](https://web.dev/css-module-scripts/)を使ってimportする必要があります。

### Updates

#### enableUpdating(_requestedUpdate: boolean): void

このメソッドはfinalとみなし、オーバーライドしてはいけません。
要素の最初の更新を発動する関数でオーバーライドされます。

#### firstUpdated(_changedProperties: [PropertyValues](https://lit.dev/docs/api/ReactiveElement/#PropertyValues)): void

要素が最初に更新された時に実行されます。
更新後の要素に対して1回だけ実行する処理を実装します。

```
firstUpdated() {
  this.renderRoot.getElementById('my-text-area').focus();
}
```

このメソッドでプロパティをセットすると進行しているアップデートサイクルが完了した後、再び要素の更新が発動します。

#### getUpdateComplete(): Promise<boolean>

`updateComplete`ゲッターが返すPromiseを返すメソッドです。
TypeScriptのtargetがES5の場合、スーパークラスのゲッターを取得することができないので、
`updateComplete`ゲッターをオーバーライドすることは安全ではありません。
代わりにこのメソッドを使います。

```
class MyElement extends LitElement {
  override async getUpdateComplete() {
    const result = await super.getUpdateComplete();
    await this._myChild.updateComplete;
    return result;
  }
}
```

#### hasUpdated: boolean

最初の更新の後、trueがセットされます。
最初の更新の前に`renderRoot`が存在することを想定していません。

#### isUpdatePending: boolean

`requestUpdate()`が発動した結果、未解決の更新がある場合はtrueです。
読み込みのみにするべきです。

#### performUpdate(): void | Promise<unknown>

要素の更新を実行します。
更新中に例外が発生した場合、`firstUpdated()`と`updated()`は実行されません。
未解決の更新をすぐに反映したい場合は`performUpdate()`を実行します。
通常、これを使うことはありませんが、同期的な更新をする必要がある場合に使用します。
未解決の更新を確実に完了されなくなる可能性があるので、`performUpdate()`をオーバーライドしてはいけません。
lit-element 2.xでは`performUpdate()`をオーバーライドして更新スケジュールを変更することを提案しました。
3.xでは代わりに`scheduleUpdate()`をオーバーライドすることで更新スケジュールを変更します。
lit-element 2.xとの後方互換性のために、`performUpdate()`による更新のスケジューリングは引き続き行われます。
しかし、`performUpdate()`を実行して同期的更新を実現することは難しいです。

#### requestUpdate(name?: PropertyKey, oldValue?: unknown, options?: PropertyDeclaration<unknown, unknown>): void

非同期的な更新を要求します。
これはリアクティブプロパティのセットで更新を発動する以外の方法で更新を発動したいときに実行します。
その場合、引数を渡してはいけません。
また、プロパティセッタを自作するときも実行する必要があります。
その場合、[プロパティオプション](https://japanese-document.github.io/lit/components-properties.html#プロパティオプション)が確実に反映されるようにプロパティの`name`と`oldValue`を渡します。

#### scheduleUpdate(): void | Promise<unknown>

要素の更新をスケジューリングします。
このメソッドをオーバーライドしてPromiseを返すことによって更新のタイミングを変更することができます。
返されたPromiseが解決されるまで更新されません。
このメソッドをオーバーライドする場合、`super.scheduleUpdate()`を実行する必要があります。
以下の例は、次のフレームの直前に更新が起こるようにスケジューリングします。

```
override protected async scheduleUpdate(): Promise<unknown> {
  await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  super.scheduleUpdate();
}
```

#### shouldUpdate(_changedProperties: [PropertyValues](https://lit.dev/docs/api/ReactiveElement/#PropertyValues)): boolean

要素が更新をリクエストした時、`update()`の実行するか判断します。
デフォルトでは、このメソッドは常にtrueを返します。
このメソッドを変更することによって`update()`の実行を判断可能にします。

#### update(changedProperties: [PropertyValues](https://lit.dev/docs/api/ReactiveElement/#PropertyValues)): void

要素を更新します。
このメソッドはプロパティの値を属性に反映して`render()`を実行してlit-htmlを使ってDOMをレンダリングします。
このメソッド内でプロパティをセットしても新たな更新を発動しません。

#### updateComplete(): Promise<boolean>

更新が完了した時に解決するPromiseを返します。
要素が新たな更新を発動せずに更新を完了した場合、Promiseの値はtrueになります。
`update()`内でプロパティがセットされた場合、Promiseの値はfalseになります。
更新中に例外が発生した場合、Promiseはrejectされます。
更新が完了したときに実行する非同期処理を追加したい場合は、`getUpdateComplete`メソッドをオーバーライドします。
その場合、最初に`await super.getUpdateComplete()`を実行して、その後に処理を追加する必要があります。

#### updated(_changedProperties: [PropertyValues](https://lit.dev/docs/api/ReactiveElement/#PropertyValues)): void

要素が更新される毎に更新されます。
更新後に実行する処理を実装します(例えば要素をfocusする処理)。

#### willUpdate(_changedProperties: [PropertyValues](https://lit.dev/docs/api/ReactiveElement/#PropertyValues)): void

更新に必要な値を生成する処理を実行します。
更新を実行する前に実行されます。
以下は、他のプロパティに依存して、以降の更新処理に使われるプロパティの値を`willUpdate()`で生成します。

```
willUpdate(changedProperties) {
  // 計算コストが高い処理なのでプロパティの値が変更されているかチェックします。
  if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
    this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
  }
}

render() {
  return html`SHA: ${this.sha}`;
}
```

## type RenderOptions

lit-htmlレンダリングをコントロールするオプションを格納するObjectです。

### Import

```
import { RenderOptions } from 'lit';
```

### メソッドとプロパティ

#### creationScope?: {importNode: (node: Node, deep?: boolean) => Node}

テンプレートの複製に使われるNodeです(このNodeの[importNode](https://developer.mozilla.org/en-US/docs/Web/API/Document/importNode)が実行されます)。
これは継承されたコンテキストとともにレンダリングされたDOMの`ownerDocument`をコントロールします。
それはデフォルトではグローバルな`document`です。

#### host?: object

イベントリスナの`this`になるobjectです。
テンプレートをレンダリングするホストコンポーネントをセットすると便利なことがよくあります。

#### isConnected?: boolean

レンダリングされる最上位のNodeが初期状態で配置されるかどうか。

#### renderBefore?: ChildNode | null

レンダリングで生成されたDOM Nodeが挿入される位置の前にあるDOM Node

---

## License

### Japanese part

[Creative Commons Attribution-NonCommercial 4.0 International Public License](https://creativecommons.org/licenses/by-nc/4.0/legalcode)

Copyright (c) 2022 38elements

### Other

[Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/deed.en)

Copyright (c) 2020 Google LLC. All rights reserved.

BSD 3-Clause License

Copyright (c) 2020 Google LLC. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.