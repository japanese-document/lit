{ "header": {"name": "コンポーネント", "order": 0}, "order": 2 }
---
# リアクティブプロパティ

Litコンポーネントは(要素の属性やプロパティからの)入力を受け取ってステートをクラスフィールドもしくはプロパティに保存します。
リアクティブプロパティ(Reactive properties)は値が変更されるとリアクティブアップデートサイクルが発動され、コンポーネントが再レンダリングされます。
そして、[オプションの設定](#attribute)によって要素の属性を読み書きすることが可能です。

```ts
class MyElement extends LitElement {
  @property()
  name: string;
}
```

```js
class MyElement extends LitElement {
  static properties = {
    name: {},
  };
}
```

Litはリアクティブプロパティとそれに関連した要素の属性を取り扱います。

*   **Reactive updates** Litは各リアクティブプロパティ毎にゲッタ/セッタのペアを生成します。リアクティブプロパティが変更されると、コンポーネントは更新をスケジューリングします。 
*   **Attribute handling** デフォルトでLitはコンポーネントのプロパティと対を成す要素の属性を用意します。そして、その属性が変更されるとそれに対応するプロパティを更新します。プロパティオプションの設定でプロパティの値を属性に反映することができます。
*   **Superclass properties** Litはスーパークラスで設定したプロパティオプションを自動的に適用します。そのオプションを変更したい場合を除いて再度プロパティを定義する必要はありません。 
*   **Element upgrade** コンポーネントに対応しているcustom elementsが既にDOMに存在ている状態でLitコンポーネントの定義が実行された場合、Litはcustom elementsにコンポーネントを適用します。
custom elementsにセットされているプロパティや属性をコンポーネントに反映します。

## パブリックプロパティとインターナルステート   

パブリックプロパティはコンポーネントのパブリックAPIの一部です。
一般的に、パブリックプロパティ、その中でもリアクティブプロパティは入力を扱います。

ユーザの入力に対応する以外でコンポーネントのパブリックプロパティを変更するべきではありません。
例えばメニューコンポーネントに`selected`プロパティがあったとして、それは要素の属性として初期値を指定することができるとします。
ユーザが項目を選択した場合はコンポーネントが`selected`プロパティを更新するべきです。
この場合、コンポーネントはイベントをでティスパッチ(dispatch)してコンポーネントの親コンポーネントに`selected`プロパティが変更されたことを示す必要があるかもしれません。
詳しくは[Dispatching events](https://lit.dev/docs/components/events/#dispatching-events)を見てください。

Litにはインターナルリアクティブステート(internal reactive state)機能があります。
インターナルリアクティブステートはコンポーネントのAPIに含まれないリアクティブプロパティです。
このプロパティは対応する要素の属性を持ちません。通常、TypeScriptではprotectedもしはprivateにします。

```ts
@state()
private _counter = 0;
```

```js
static properties = {
  _counter: {state: true};
};

constructor()
  super();
  this._counter = 0;
}
```

コンポーネントはインターナルリアクティブステートを扱います。
パブリックプロパティと同様にインターナルリアクティブステートを更新するとアップデートサイクルが発動します。
詳しくは[インターナルリアクティブステート](#インターナルリアクティブステート)を見てください。

## パブリックリアクティブプロパティ

要素のリアクティブプロパティはデコレータもしくは`static properties`を使って宣言します。

いづれの場合も、オプションオブジェクトを渡すことでプロパティの動作を変更することができます。

### デコレータでプロパティを設定する

下記のように`@property`デコレータをクラスフィールドの宣言に付与することでリアクティブプロパティを宣言します。

```ts
class MyElement extends LitElement {
  @property({type: String})
  mode: string;

  @property({attribute: false})
  data = {};
}
```

`@property`デコレータの引数は[プロパティオプション](#プロパティオプション)です。
プロパティオプションを渡さないと全てのオプションのデフォルト値が適用されます。

### static propertiesフィールドでプロパティを設定する

下記のように`static properties`を使ってプロパティを設定します。

```js
class MyElement extends LitElement {
  static properties = {
    mode: {type: String},
    data: {attribute: false},
  };

  constructor() {
    super();
    this.data = {};
  }
}
```

空のオプションオブジェクト(`{}`)が渡された場合はデフォルトのオプションが適用されます。

### プロパティオプション

オプションオブジェクトに以下のプロパティを設定することができます。

#### attribute

プロパティに関連した属性を有効にするか、またはその属性名を変更したい場合はその属性名を渡します。
デフォルトはtrueです。
`attribute`をfalseにすると`converter`、`reflect`、`type`オプションは無視されます。
詳しくは[attributeオプション](#attributeオプション)を見てください。

#### converter

プロパティと属性を相互に変換するための[カスタムプロパティコンバータ](#カスタムプロパティコンバータ)を渡します。
渡されない場合は[デフォルトプロパティコンバータ](#デフォルトプロパティコンバータ)を使います。

#### hasChanged

プロパティがセットされる毎に実行されます。更新を発動するか判定します。
デフォルトでは不等式(`newValue !== oldValue`)による判定を行います。
詳しくは[変更判定の変更](#変更判定の変更)を見てください。

#### noAccessor

trueをセットするとデフォルトのプロパティアクセサを生成しません。
このオプションを使うことはほとんどないでしょう。
デフォルトはfalseです。
詳しくは[noAccessorオプション](#noAccessorオプション)を見てください。

#### reflect

trueをセットするとプロパティの値をcustom elementのプロパティに対応する属性に反映します。
デフォルトはfalseです。
詳しくは[reflectオプション](#reflectオプション)を見てください。

#### state

trueをセットするとプロパティはインターナルリアクティブステートになります。
インターナルリアクティブステートはパブリックリアクティブプロパティのように更新を発動しますが、
Litはプロパティに対応する属性を生成しません。
そして、コンポーネント外からインターナルリアクティブステートのプロパティにアクセスするべきではありません。
このオプションは`@state`デコレータと同じ効果を付与します。
デフォルトはfalseです。
詳しくは[インターナルリアクティブステート](#インターナルリアクティブステート)を見てください。

#### type

文字列である属性をプロパティに変換する際に
Litのデフォルトのコンバータはその文字列の値を指定された型(`type`)に変換します。
プロパティから属性に変換する場合は、その逆です。
`converter`オプションがセットされている場合、
このオプションの値は`converter`オプションに渡されます。
セットされていない場合、デフォルトプロパティコンバータは`String`に変換します。
詳しくは[デフォルトプロパティコンバータ](#デフォルトプロパティコンバータ)を見てください。

TypeScriptを使う場合は、このオプションはフィールドの型と一致させる必要があります。
`type`オプションはLitのランタイムではシリアライズとデシリアライズに使われます。
TypeScriptの型チェックと混同しないように注意してください。

オプションオブジェクトを指定しないもしくは空のオプションオブジェクトを指定することは、すべてのオプションにデフォルトの値を指定することと等価です。

## インターナルリアクティブステート

インターナルリアクティブステートはコンポーネントのpublicなAPIではないリアクティブプロパティです。
このプロパティは対応する要素の属性を持ちません。
そして、コンポーネントの外側からアクセスされることを意図していません。
インターナルリアクティブステートはコンポーネントの内部でのみ使用されるべきです。

下記のように`@state`デコレータを付与することによってインターナルリアクティブステートになります。

```ts
@state()
protected _active = false;
```

`static properties`クラスフィールドを使う場合は、プロパティオプションに`state: true`をセットするとインターナルリアクティブステートになります。

```js
static properties = {
  _active: {state: true}
};

constructor() {
  this._active = false;
}
```

インターナルリアクティブステートはコンポーネントの外部から参照されるべきではありません。
TypeScriptではprivateもしくはprotectedを付けるべきです。
JavaScriptでは上記のようにprivateもしくはprotectedであるプロパティと認識できるように`_`をプロパティ名の先頭につけることを推奨します。

プロパティに関連した属性を持たないことを除いて、
インターナルリアクティブステートはパブリックリアクティブプロパティと同じ動作をします。
インターナルリアクティブステートに指定することができるプロパティオプションは`hasChanged`のみです。

`@state`デコレータはminifierにプロパティ名が変更可能であるというヒントを与えます。

## プロパティが変更されると何が起きるか 

プロパティの変更はリアクティブアップデートサイクル(reactive update cycle)を発動します。
それはコンポーネントがテンプレートを再レンダリングすることを引き起こします。

プロパティが変更されると、下記の順番で処理が実行されます。

1. プロパティのセッタが実行されます。
1. プロパティのセッタがコンポーネントの`requestUpdate`メソッドを実行します。
1. プロパティの変更前の値と変更後の値を比較します。
    - デフォルトでは`newValue !== oldValue`のように比較します。
    - プロパティに`hasChanged`オプションがセットされている場合、 `hasChanged`関数はプロパティの変更前の値と変更後の値を引数にします。
1. プロパティが変更されたと判定された場合、非同期的に更新がスケジュールされます。既に更新がスケジュールされていた場合はまとめて1回だけ更新が実行されます。
1. コンポーネントの`update`メソッドが実行されます。(変更されたプロパティが属性に反映されます。コンポーネントのテンプレートが再レンダリングされます。)

プロパティの値がオブジェクトもしくは配列の場合、それ自体を置き換えないと更新が発動しません。
詳しくは[プロパティでオブジェクトや配列を扱う際の注意点](#プロパティでオブジェクトや配列を扱う際の注意点)を見てください。

リアクティブアップデートサイクルのフックは多数あります。それらを変更することができます。
詳しくは[リアクティブアップデートサイクル](https://lit.dev/docs/components/lifecycle/#reactive-update-cycle)を見てください。

プロパティの変更判定の詳しい情報は[変更判定の変更](#変更判定の変更)を見てください。

### プロパティでオブジェクトや配列を扱う際の注意点

プロパティの値がオブジェクトもしくは配列の場合、その参照を変更しないと更新は発動しません。
プロパティの値がオブジェクトもしくは配列の場合、下記の2つの方法で操作することができます。

#### 値の置き換える

オブジェクトや配列をイミュータブル(immutable)として扱います。
下記のように、`myArray`から要素を削除する場合に新しい配列を作成します。

```js
this.myArray = this.myArray.filter((_, i) => i !== indexToRemove);
```

この例ではシンプルなデータを扱っていますが、
複雑なオブジェクトを扱う場合は[Immer](https://immerjs.github.io/immer/)のようなイミュータブルにデータを扱うためのライブラリを使うと可読性を保つことができるかもしれません。

#### 手動で更新を発動する 

下記のようにデータを変更して直接的に更新を発動するために[requestUpdate()](https://japanese-document.github.io/lit/api-LitElement.html#requestUpdate(name___PropertyKey,_oldValue___unknown,_options___PropertyDeclaration%3Cunknown,_unknown%3E)__void)を実行します。

```js
this.myArray.splice(indexToRemove, 1);
this.requestUpdate();
```

`requestUpdate()`が引数無しで実行されると`hasChanged()`関数をスキップして更新がスケジュールされます。
`requestUpdate()`を実行したコンポーネントのみが更新されることに注意してください。
例えば、上記のコードでは`this.myArray`を子コンポーネントのプロパティに渡すと参照が変わらないので変更を検知できません。
だから、子コンポーネントは更新されません。

一般的にほとんどのアプリケーションではイミュータブルオブジェクトをバケツリレーで受け渡すことが最善の方法です。
そうすることで必要なコンポーネントが確実に新しい値をレンダリングできるようになります。
(これによって、変更されたデータに依存しているコンポーネントのみが変更され、アプリケーション全体を更新するよりは効率的です。)

データを変更して`requestUpdate()`を実行する方法は上級者向けです。
この方法では、
データを変更するすべてのコンポーネントを特定して、各コンポーネントで`requestUpdate()`を実行する必要があります。
そうしないと、コンポーネントが期待通り更新されないかもしれません。
このようなコンポーネントがアプリケーションに広がっている場合、管理が大変です。

## 属性

JavaScriptのコードでコンポーネントへの入力として、
コンポーネントインスタンスのプロパティもしくはエクスプレッションを使うことで、
コンポーネントのプロパティにJavaScriptのデータをセットすることができます。
マークアップ内でコンポーネントへの入力として要素の属性に値をセットすることができます。
リアクティブプロパティに対してプロパティと属性の両方のインターファイスを提供することによって、
JavaScriptのコード内だけでなくサーバー側のウェブアプリケーションフレームワークのテンプレートが出力する静的なHTML等でLitコンポーネントを使用することを可能にします。
デフォルトでLitは各パブリックリアクティブプロパティに対応する属性を監視します。そして、属性が変更されるとそれに対応するプロパティが更新されます。
reflectオプションをセットするとプロパティが変更されると属性に反映されます。

要素のプロパティやコンポーネントのプロパティの場合は素のJavaScriptのデータがコンポーネントのプロパティに渡されますが、
要素の属性の場合は文字列がコンポーネントのプロパティに渡されます。
これは要素の属性とコンポーネントのプロパティ間の相互変換に影響を与えます。

* 要素の属性の値をコンポーネントのプロパティにセットする際は属性の値はプロパティの型に合わせて変換する必要があります。
* コンポーネントのプロパティを要素の属性にセットする際はプロパティの値を文字列に変換する必要があります。

### attributeオプション

デフォルトでLitはすべてのパブリックリアクティブプロパティに対応する属性を作成します。
プロパティ名をすべて小文字にしたものが相互変換する属性名になります。

```ts
// 相互変換する属性名はmyvalueになります。
@property({ type: Number })
myValue = 0;
```

```js
// 相互変換する属性名はmyvalueになります。
static properties = {
  myValue: { type: Number },
};

constructor() {
  super();
  this.myValue = 0;
}
```

`attribute`オプションに文字列を渡すと相互変換する属性名を違う名前にすることができます。


```ts
// 相互変換する属性名はmy-nameになります。
@property({ attribute: 'my-name' })
myName = 'Ogden';
```

```js
// 相互変換する属性名はmy-nameになります。
static properties = {
  myName: { attribute: 'my-name' },
};

constructor() {
  super();
  this.myName = 'Ogden'
}
```

コンポーネントのプロパティと相互変換する要素の属性を作成しない場合は`attribute`オプションに`false`を指定します。
そうするとプロパティは属性の値によって初期化されません。そして、属性の値が変化してもプロパティの値は変化しません。

```ts
// プロパティと相互変換する属性を作成しません。
@property({ attribute: false })
myData = {};
```

```js
// プロパティと相互変換する属性を作成しません。
static properties = {
  myData: { attribute: false },
};

constructor() {
  super();
  this.myData = {};
}
```

インターナルリアクティブステートは要素の属性の影響をまったく受けません。

下記のようにマークアップで相互変換する属性に値をセットすることによってコンポーネントのプロパティの初期値をセットすることができます。

```html
<my-element myvalue="99"></my-element>
```

### デフォルトプロパティコンバータ

Litのデフォルトプロパティコンバータは`String`、`Number`、`Boolean`、`Array`、`Object`をプロパティの型として取り扱います。

デフォルトプロパティコンバータを使うには、プロパティに`type`プロパティオプションをセットします。

```ts
// デフォルトプロパティコンバータを使います。
@property({ type: Number })
count = 0;
```

```js
// デフォルトプロパティコンバータを使います。
static properties = {
  count: { type: Number },
};

constructor() {
  super();
  this.count = 0;
}
```

デフォルトプロパティコンバータもしくはカスタムプロパティコンバータをプロパティにセットしない場合、
デフォルトで`type: String`がセットされます。

各デフォルトプロパティコンバータの動作を下記の表で説明します。

#### 要素の属性からコンポーネントのプロパティへ

| 型 | 変換 |
|:--------|:-----------|
| `String`  | 要素に対応する属性があると、プロパティにその属性の値をセットします。 |
| `Number`  | 要素に対応する属性があると、プロパティに`Number(attributeValue)`をセットします。 |
| `Boolean` | 要素に対応する属性があると、プロパティに`true`をセットします。<br>そうでない場合、プロパティに`false`をセットします。 |
| `Object`, `Array` | 要素に対応する属性があると、プロパティに`JSON.parse(attributeValue)`をセットします。 |

`Boolean`以外の場合で 
要素に対応する属性がない場合、
プロパティはデフォルトの値もしくはデフォルトの値がセットされていない場合は`undefined`になります。

#### コンポーネントのプロパティから要素の属性へ

| 型 | 変換 |
|:--------|:-----------|
| `String`, `Number` | プロパティがnullもしくはundefinedでない場合、属性にプロパティの値をセットします。<br>プロパティの値がnullもしくはundefinedの場合、要素から属性を削除します。 |
| `Boolean` | プロパティの値がtrueになる値の場合、要素に空の属性を作成します。 <br>プロパティの値がfalseに値の場合、要素から属性を削除します。 |
| `Object`, `Array` | プロパティがnullもしくはundefinedでない場合、属性に`JSON.stringify(propertyValue)`をセットします。<br>プロパティの値がnullもしくはundefinedの場合、要素から属性を削除します。 |

### カスタムプロパティコンバータ

カスタムプロパティコンバータはプロパティの宣言時にプロパティオプションの`converter`オプションでセットすることができます。

```js
myProp: {
  converter: // カスタムプロパティコンバータ
}
```

`converter`オプションにはオブジェクト(object)もしくは関数をセットすることができます。
オブジェクトをセットする場合、下記のように`fromAttribute`と`toAttribute`を設定することができます。


```js
prop1: {
  converter: {
    fromAttribute: (value, type) => {
      // `value`は文字列です。
      // それを`type`型に変換して返します。
    },
    toAttribute: (value, type) => {
      // `value` は`type`型です。
      // それを文字列に変換して返します。
    }
  }
}
```

`converter`が関数の場合、その関数は上記の`fromAttribute`の役割を行います。

```js
myProp: {
  converter: (value, type) => {
      // `value`は文字列です。
      // それを`type`型に変換して返します。
  }
}
```

`toAttribute`をセットされていないプロパティは、デフォルトのコンバータが適用されます。

`toAttribute`が`null`もしくは`undefined`を返すと属性が削除されます。

### reflectオプション

コンポーネントのプロパティが変更されると、それに[対応する要素の属性](#attributeオプション)に反映できるように設定することができます。
反映された要素の属性はCSSセレクタに使うことができるので便利です。

```js
// nameプロパティの値は属性に反映されます。
name: {reflect: true}
```

プロパティが変更されると、
Litは[デフォルトプロパティコンバータ](#デフォルトプロパティコンバータ)もしくは[カスタムプロパティコンバータ](#カスタムプロパティコンバータ)を使ってプロパティの値を変換します。その値を属性にセットします。

```ts
import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({type: Boolean, reflect: true})
  active: boolean = false;

  static styles = css`
    :host {
      display: inline-block;
    }

    :host([active]) {
      border: 1px solid red;
    }`;

  render() {
    return html`
      <span>Active: ${this.active}</span>
      <button @click="${() => this.active = !this.active}">Toggle active</button>
    `;
  }
}
```

一般的に属性は要素への外部からの入力とみなされます。だから、要素の内部に保持されているプロパティの値を属性に反映する際は注意する必要があります。
今はスタイルやアクセシビリティのためにそうすることが必要です。
将来、[`:state` pseudo selector](https://wicg.github.io/custom-state-pseudo-class/)と[Accessibility Object Model](https://wicg.github.io/aom/spec/)がサポートされれば、そのために属性を反映する必要はなくなります。

大きいオブジェクトのシリアライズはパフォーマンスの低下をもたらす原因になるので、
型がオブジェクトもしくは配列のプロパティを属性に反映することはお勧めしません。

更新している間、Litはステートの反映を確認します。
プロパティの変更が属性に反映されて、属性の変更がプロパティを更新することで無限ループが発生する可能性があると不安に思うかもしれません。
これを防ぐために、Litはプロパティや属性がセットされると確認します。

## カスタムプロパティアクセサ

デフォルトでLitElementはすべてのリアクティブプロパティに対してセッタ/ゲッタのペアを生成します。
プロパティをセットする毎にセッタが実行されます。

```ts
// プロパティの宣言
@property()
greeting: string = 'Hello';
...
// 後にプロパティをセットします。
this.greeting = 'Hola'; // 生成されたgreetingのプロパティアクセサを実行します。
```

```js
// プロパティの宣言
static properties = {
  greeting: {},
}
constructor() {
  this.super();
  this.greeting = 'Hello';
}
...
// 後にプロパティをセットします。
this.greeting = 'Hola'; // 生成されたgreetingのプロパティアクセサを実行します。
```

生成されたアクセサは自動的に`requestUpdate()`を実行します。
そして、更新中でない場合、更新を開始します。

### カスタムプロパティアクセサを作成する

下記のようにプロパティのゲッタとセッタを変更することで、プロパティを取得する処理やセットする処理を変更することができます。

```ts
private _prop = 0;

set prop(val: number) {
  let oldVal = this._prop;
  this._prop = Math.floor(val);
  this.requestUpdate('prop', oldVal);
}

@property()
get prop() { return this._prop; }
```

```js
static properties = {
  prop: {},
};

_prop = 0;

set prop(val) {
  let oldVal = this._prop;
  this._prop = Math.floor(val);
  this.requestUpdate('prop', oldVal);
}

get prop() { return this._prop; }
```

`@property`や`@state`と一緒にカスタムプロパティアクセサを設定する際は、上記のようにゲッタにデコレータを配置します。

Litが生成したセッタは自動的に`requestUpdate()`を実行します。
セッタを変更する場合、上記のようにプロパティ名とその変更前の値を`requestUpdate()`を渡して実行する必要があります。

ほとんどの場合、カスタムプロパティアクセサを設定する必要はありません。
変更後のプロパティを使った処理を行う場合は[`willUpdate`](https://lit.dev/docs/components/lifecycle/#willupdate)コールバックを使うことを推奨します。この方法ではアップデートサイクル中にプロパティの値を変更したとしても、新たな更新は発動しません。
要素が更新された後に実行される処理を変更したい場合は[`updated`](https://lit.dev/docs/components/lifecycle/#updated)コールバックを使うことを推奨します。

クラスでプロパティに対するアクセサが定義されている場合、Litはそれらをデフォルトのアクセサで上書きしません。
クラスでプロパティを定義してそのプロパティに対するアクセサが定義されていない場合、スーパークラスでプロパティとアクセサが定義されていてもLitはデフォルトのアクセサを使います。

### noAccessorオプション

クラスでプロパティを定義してそのプロパティに対するアクセサが定義されていない場合、スーパークラスでプロパティとアクセサが定義されていてもLitはデフォルトのアクセサを使います。
この場合でスーパークラスで定義されたアクセサを使うには`noAccessor`に`true`をセットします。

```js
static properties = {
  myProp: { type: Number, noAccessor: true }
};
```

クラスでアクセサを定義している場合、`noAccessor`をセットする必要はありません。

## 変更判定の変更

リアクティブプロパティに値をセットすると`hasChanged()`が実行されます。

`hasChanged`はプロパティの1つ前の値と現在の値を比較します。そして、プロパティが変更されたかどうか判定します。
`hasChanged()`がtrueを返すと、更新が既にスケジュールされていない場合、Litは要素の更新を開始します。
更新に関する詳しい情報は[リアクティブアップデートサイクル](https://lit.dev/docs/components/lifecycle/#reactive-update-cycle)を見てください。

`hasChanged()`のデフォルトの実装は`newVal !== oldVal`です。

下記のようにプロパティオプションに関数をセットすることで`hasChanged()`を変更することができます。

```ts
@property({
  hasChanged(newVal: string, oldVal: string) {
    return newVal?.toLowerCase() !== oldVal?.toLowerCase();
  }
})
myProp: string | undefined;
```

```js
static properties = {
  myProp: {
    hasChanged(newVal, oldVal) {
      return newVal?.toLowerCase() !== oldVal?.toLowerCase();
    }
  }
};
```

下記の例では`hasChanged()`は奇数の場合のみtrueを返します。

```ts
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {
  @property({
    // newValが奇数の場合のみ更新されます。
    hasChanged(newVal: number, oldVal: number) {
      const hasChanged: boolean = newVal % 2 == 1;
      console.log(`${newVal}, ${oldVal}, ${hasChanged}`);
      return hasChanged;
    },
  })
  value: number = 1;

  render() {
    return html`
      <p>${this.value}</p>
      <button @click="${this.getNewVal}">Get new value</button>
    `;
  }

  getNewVal() {
    this.value = Math.floor(Math.random() * 100);
  }
}
```

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