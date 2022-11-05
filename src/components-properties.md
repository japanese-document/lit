{ "header": {"name": "コンポーネント", "order": 0}, "order": 2 }
---
# リアクティブプロパティ

Litコンポーネントは(要素の属性やプロパティからの)入力を受け取ってステートをクラスフィールドもしくはプロパティに保存します。
リアクティブプロパティ(Reactive properties)は値が変更されるとリアクティブな更新サイクルが発動され、コンポーネントが再レンダリングされます。
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
*   **Attribute handling** デフォルトでLitはプロパティに対応するオブザーブ(observe)される要素の属性をセットアップします。そして、属性が変更されるとプロパティを更新します。オプションの設定でプロパティの値を属性に反映することができます。
*   **Superclass properties** Litはスーパークラスで設定したプロパティオプションを自動的に適用します。そのオプションを変更したい場合を除いて再度プロパティを定義する必要はありません。 
*   **Element upgrade** コンポーネントに対応したcustom elementが既にDOMに存在ている状態でLitコンポーネントの定義が実行された場合、Litは要素にコンポーネントを適用します。
要素にセットされているプロパティや属性をコンポーネントに反映します。

## パブリックプロパティとインターナルステート   

パブリックプロパティはコンポーネントのパブリックAPIの一部です。
一般的に、パブリックプロパティ、その中でもリアクティブプロパティは入力を扱います。

ユーザの入力に対応する以外でコンポーネントのパブリックプロパティを変更するべきではありません。
例えばメニューコンポーネントに`selected`プロパティがあったとして、それは要素の属性として初期値を指定することができるとします。
ユーザが項目を指定した場合はコンポーネントが`selected`プロパティを更新するべきです。
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
パブリックプロパティと同様にインターナルリアクティブステートを更新すると更新サイクルが発動します。
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
詳しくは[属性名を設定する](#属性名を設定する)を見てください。

#### converter

プロパティと属性を相互に変換するための[カスタムコンバータ](#カスタムコンバータ)を渡します。
渡されない場合は[デフォルトコンバータ](#デフォルトコンバータ)を使います。

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
セットされていない場合、デフォルトコンバータは`String`に変換します。
詳しくは[デフォルトコンバータ](#デフォルトコンバータ)を見てください。

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
詳しくは[プロパティでオブジェクトと配列を扱う際の注意点](#プロパティでオブジェクトと配列を扱う際の注意点)を見てください。

リアクティブアップデートサイクルのフックは多数あります。それらを変更することができます。
詳しくは[リアクティブアップデートサイクル](https://lit.dev/docs/components/lifecycle/#reactive-update-cycle)を見てください。

プロパティの変更判定の詳しい情報は[変更判定の変更](#変更判定の変更)を見てください。

### プロパティでオブジェクトと配列を扱う際の注意点

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
In this case, you (or some other system) need to identify all the components that use the mutated data and call `requestUpdate()` on each one.
When those components are spread across an application, this gets hard to manage.
Not doing so robustly means that you might modify an object that's rendered in two parts of your application,
but only have one part update.

In simple cases, when you know that a given piece of data is only used in a single component,
it should be safe to mutate the data and call `requestUpdate()`, if you prefer.

## 属性

While properties are great for receiving JavaScript data as input, attributes are the standard way HTML allows configuring elements from _markup_, without needing to use JavaScript to set properties. Providing both a property _and_ attribute interface for their reactive properties is a key way Lit components can be useful in a wide variety of environments, including those rendered without a client-side templating engine, such as static HTML pages served from CMSs.

By default, Lit sets up an observed attribute corresponding to each public reactive property, and updates the property when the attribute changes. Property values can also, optionally, be _reflected_ (written back to the attribute).

While element properties can be of any type, attributes are always strings. This impacts the [observed attributes](#observed-attributes) and [reflected attributes](#reflected-attributes) of non-string properties:

  * To **observe** an attribute (set a property from an attribute), the attribute value must be converted from a string to match the property type.

  * To **reflect** an attribute (set an attribute from a property), the property value must be converted to a string.

### 属性名を設定する

By default, Lit creates a corresponding observed attribute for all public reactive properties. The name of the observed attribute is the property name, lowercased:

{% switchable-sample %}

```ts
// observed attribute name is "myvalue"
@property({ type: Number })
myValue = 0;
```

```js
// observed attribute name is "myvalue"
static properties = {
  myValue: { type: Number },
};

constructor() {
  super();
  this.myValue = 0;
}
```

{% endswitchable-sample %}

To create an observed attribute with a different name, set `attribute` to a string:

{% switchable-sample %}

```ts
// Observed attribute will be called my-name
@property({ attribute: 'my-name' })
myName = 'Ogden';
```

```js
// Observed attribute will be called my-name
static properties = {
  myName: { attribute: 'my-name' },
};

constructor() {
  super();
  this.myName = 'Ogden'
}
```

{% endswitchable-sample %}

To prevent an observed attribute from being created for a property, set `attribute` to `false`. The property will not be initialized from attributes in markup, and attribute changes won't affect it.

{% switchable-sample %}

```ts
// No observed attribute for this property
@property({ attribute: false })
myData = {};
```

```js
// No observed attribute for this property
static properties = {
  myData: { attribute: false },
};

constructor() {
  super();
  this.myData = {};
}
```

{% endswitchable-sample %}

Internal reactive state never has an associated attribute.

An observed attribute can be used to provide an initial value for a property from markup. For example:

```html
<my-element myvalue="99"></my-element>
```

### デフォルトコンバータ

Lit has a default converter that handles `String`, `Number`, `Boolean`, `Array`, and `Object` property types.

To use the default converter, specify the `type` option in your property declaration:

{% switchable-sample %}

```ts
// Use the default converter
@property({ type: Number })
count = 0;
```

```js
// Use the default converter
static properties = {
  count: { type: Number },
};

constructor() {
  super();
  this.count = 0;
}
```

{% endswitchable-sample %}

If you don't specify a type _or_ a custom converter for a property, it behaves as if you'd specified `type: String`.

The tables below shows how the default converter handles conversion for each type.

**From attribute to property**

| Type    | Conversion |
|:--------|:-----------|
| `String`  | If the element has the corresponding attribute, set the property to the attribute value. |
| `Number`  | If the element has the corresponding attribute, set the property to `Number(attributeValue)`. |
| `Boolean` | If the element has the corresponding attribute, set the property to true.<br>If not, set the property to false. |
| `Object`, `Array` | If the element has the corresponding attribute, set the property value to `JSON.parse(attributeValue)`. |

For any case except `Boolean`, if the element doesn't have the corresponding attribute, the property keeps its default value, or `undefined` if no default is set.

**From property to attribute**

| Type    | Conversion |
|:--------|:-----------|
| `String`, `Number` | If property is defined and non-null, set the attribute to the property value.<br>If property is null or undefined, remove the attribute. |
| `Boolean` | If property is truthy, create the attribute and set its value to an empty string. <br>If property is falsy, remove the attribute |
| `Object`, `Array` | If property is defined and non-null, set the attribute to `JSON.stringify(propertyValue)`.<br>If property is null or undefined, remove the attribute. |


### カスタムコンバータ

You can specify a custom property converter in your property declaration with the `converter` option:

```js
myProp: {
  converter: // Custom property converter
}
```

`converter` can be an object or a function. If it is an object, it can have keys for `fromAttribute` and `toAttribute`:

```js
prop1: {
  converter: {
    fromAttribute: (value, type) => {
      // `value` is a string
      // Convert it to a value of type `type` and return it
    },
    toAttribute: (value, type) => {
      // `value` is of type `type`
      // Convert it to a string and return it
    }
  }
}
```

If `converter` is a function, it is used in place of `fromAttribute`:

```js
myProp: {
  converter: (value, type) => {
    // `value` is a string
    // Convert it to a value of type `type` and return it
  }
}
```

If no `toAttribute` function is supplied for a reflected attribute, the attribute is set to the property value using the default converter.

If `toAttribute` returns `null` or `undefined`, the attribute is removed.

### reflectオプション

You can configure a property so that whenever it changes, its value is reflected to its [corresponding attribute](#observed-attributes). Reflected attributes are useful because attributes are visible to CSS, and to DOM APIs like `querySelector`.

For example:

```js
// Value of property "active" will reflect to attribute "active"
active: {reflect: true}
```

When the property changes, Lit sets the corresponding attribute value as described in [Using the default converter](#conversion-type) or [Providing a custom converter](#conversion-converter).

{% playground-example "properties/attributereflect" "my-element.ts" %}

Attributes should generally be considered input to the element from its owner, rather than under control of the element itself, so reflecting properties to attributes should be done sparingly. It's necessary today for cases like styling and accessibility, but this is likely to change as the platform adds features like the [`:state` pseudo selector](https://wicg.github.io/custom-state-pseudo-class/) and the [Accessibility Object Model](https://wicg.github.io/aom/spec/), which fill these gaps.

Reflecting properties of type object or array is not recommended. This can cause large objects to serialize to the DOM which can result in poor performance.

<div class="alert alert-info">

**Lit tracks reflection state during updates.** You may have realized that if property changes are reflected to an attribute and attribute changes update the property, it has the potential to create an infinite loop. However, Lit tracks when properties and attributes are set specifically to prevent this from happening

</div>

## Custom property accessors {#accessors}

By default, LitElement generates a getter/setter pair for all reactive properties. The setter is invoked whenever you set the property:

{% switchable-sample %}

```ts
// Declare a property
@property()
greeting: string = 'Hello';
...
// Later, set the property
this.greeting = 'Hola'; // invokes greeting's generated property accessor
```

```js
// Declare a property
static properties = {
  greeting: {},
}
constructor() {
  this.super();
  this.greeting = 'Hello';
}
...
// Later, set the property
this.greeting = 'Hola'; // invokes greeting's generated property accessor
```

{% endswitchable-sample %}

Generated accessors automatically call `requestUpdate()`, initiating an update if one has not already begun.

### Creating custom property accessors {#accessors-custom}

To specify how getting and setting works for a property, you can define your own getter/setter pair. For example:

{% switchable-sample %}

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

{% endswitchable-sample %}

To use custom property accessors with the `@property` or `@state` decorators, put the decorator on the getter, as shown above.

The setters that Lit generates automatically call `requestUpdate()`. If you write your own setter you must call `requestUpdate()` manually, supplying the property name and its old value.

In most cases, **you do not need to create custom property accessors.** To compute values from existing properties, we recommend using the [`willUpdate`](https://lit.dev/docs/components/lifecycle/#willupdate) callback, which allows you to set values during the update cycle without triggering an additional update. To perform a custom action after the element updates, we recommend using the [`updated`](https://lit.dev/docs/components/lifecycle/#updated) callback. A custom setter can be used in rare cases when it's important to synchronously validate any value the user sets.

If your class defines its own accessors for a property, Lit will not overwrite them with generated accessors. If your class does not define accessors for a property, Lit will generate them, even if a superclass has defined the property or accessors.

### noAccessorオプション

In rare cases, a subclass may need to change or add property options for a property that exists on its superclass.

To prevent Lit from generating a property accessor that overwrites the superclass's defined accessor, set `noAccessor` to `true` in the property declaration:

```js
static properties = {
  myProp: { type: Number, noAccessor: true }
};
```

You don't need to set `noAccessor` when defining your own accessors.

## 変更判定の変更

All reactive properties have a function, `hasChanged()`, which is called when the property is set.

`hasChanged` compares the property's old and new values, and evaluates whether or not the property has changed. If `hasChanged()` returns true, Lit starts an element update if one is not already scheduled. For more information on updates, see [Reactive update cycle](https://lit.dev/docs/components/lifecycle/#reactive-update-cycle) .

The default implementation of `hasChanged()` uses a strict inequality comparison: `hasChanged()` returns `true` if `newVal !== oldVal`.

To customize `hasChanged()` for a property, specify it as a property option:

{% switchable-sample %}

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

{% endswitchable-sample %}

In the following example, `hasChanged()` only returns true for odd values.

{% playground-example "properties/haschanged" "my-element.ts" %}

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