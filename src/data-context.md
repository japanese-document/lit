{ "header": {"name": "データ管理", "order": 3}, "order": 0 }
---
# コンテキスト

コンテキスト(Context)を使うと各コンポーネントのプロパティに値を手動でセットすることなしに、コンポーネントのサブツリー全体にデータを行き渡らせることができます。
データはコンテキスト上で利用することができます。だから、データのプロバイダとコンシューマの間にある要素はコンテキストを効力する必要はありません。

Litのコンテキストは`@lit/context`で実装されています。

```bash
npm i @lit/context
```

コンテキストはアプリのデータストア、ユーザのデータ、UIテーマのようなデータを多数のコンポーネントに流通することに使用します。
また、普通のDOMの子要素にデータを渡す必要があるような、データを渡すことができない場合にも使用します。

LitのコンテキストはReactのコンテキストやAngularのDIシステムにとても似ています。
しかし、Litのコンテキストは動的なDOM構造の変化に対応しています。また、他のweb componentを使ったライブラリやフレームワークや素のJavaScriptでも利用することができます。

## 例

コンテキストはコンテキストオブジェクト、プロバイダ(provider)、コンシューマ(consumer)で構成されています。
コンテキストオブジェクトを使ってデータを流通させます。

* コンテキストの定義(`logger-context.ts`)

```ts
import {createContext} from '@lit/context';
import type {Logger} from 'my-logging-library';
export type {Logger} from 'my-logging-library';
export const loggerContext = createContext<Logger>('logger');
```

* プロバイダ

```ts
import {LitElement, property, html} from 'lit';
import {provide} from '@lit/context';

import {Logger} from 'my-logging-library';
import {loggerContext} from './logger-context.js';

@customElement('my-app')
class MyApp extends LitElement {

  @provide({context: loggerContext})
  logger = new Logger();

  render() {
    return html`...`;
  }
}
```

* コンシューマ

```ts
import {LitElement, property} from 'lit';
import {consume} from '@lit/context';

import {type Logger, loggerContext} from './logger-context.js';

export class MyElement extends LitElement {

  @consume({context: loggerContext})
  @property({attribute: false})
  public logger?: Logger;

  private doThing() {
    this.logger?.log('A thing was done');
  }
}
```

## キーコンセプト

### コンテキストプロトコル

LitのコンテキストはW3Cの[Web Components Community Group](https://www.w3.org/community/webcomponents/)によって作成された[Context Community Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md)に基づいています。

このプロトコルに従うとライブラリ関係なく要素(もしくは要素ではないコードでも)にコンテキストを介してデータを共有することができます。
このコンテキストプロトコルを経由して、Litの要素はLitで作られていないコンシューマでもデータを供給できます。また、その逆も可能です。

コンテキストプロトコルはDOMイベントをベースにしています。
コンシューマは必要なコンテキストオブジェクトを取得するために`context-request`イベントを送出します。
コンシューマより上位の要素は`context-request`イベントをリッスンすることができます。そして、コンテキストオブジェクトに対応するデータを供給します。

`@lit/context`はこのイベントベースのプロトコルを実装しています。リアクティブコントローラやデコレータを使ってこれを使います。

### コンテキストオブジェクト

コンテキストの値はコンテキストオブジェクトに紐づいています。
コンテキストオブジェクトとコンテキストの値は`Map`のキーと値に似ています。

### プロバイダ

一般的にプロバイダは要素です。(イベントハンドラでも可能です。)プロバイダはコンテキストオブジェクトに対応したデータを提供します。

### コンシューマ

コンシューマはコンテキストオブジェクトに対応するデータをリクエストします。

### サブスクリプション

コンシューマがコンテキストのデータをリクエストする時、プロバイダにコンテキストのデータをサブスクライブ(subscribe)することを通知することができます。
プロバイダに新しい値をセットすると、コンシューマに通知されて自動的に更新されます。

## 使い方

### コンテキストを定義する

コンテキストはデータリクエストに対応したコンテキストオブジェクトを持つ必要があります。
コンテキストオブジェクトはそのデータのidと型を表します。

コンテキストオブジェクトは下記のように`createContext()`を使って生成します。

```ts
export const myContext = createContext(Symbol('my-context'));
```

#### コンテキストの型チェック

`createContext()`は任意の値を受け取って、受け取った値をそのまま返します。
TypeScriptでは、戻り値を`Context`型のオブジェクトにキャストします。
そのオブジェクトはコンテクストオブジェクトとそれに対応する値の型を内包しています。

下記のコードには間違いがあります。
下記のコードでは、TypeScriptは`string`型は`Logger`型に割り当てることができないという警告を出すでしょう。
このチェックは現時点ではpublicフィールドのみ対象となります。

```ts
const myContext = createContext<Logger>(Symbol('logger'));

class MyElement extends LitElement {
  @provide({context: myContext})
  name: string
}
```

#### コンテキストの比較

プロバイダはコンテクストオブジェクトをコンテキストリクエストイベントに対応する値を取得することに使いします。
プロバイダはプロバイダに設定されたコンテキストオブジェクトとリクエストのコンテキストオブジェクトが一致した場合のみ処理を行います。
その比較は`===`で行われます。

これを考慮するとコンテキストオブジェクトを生成する方法は主に下記の2つです。

1. オブジェクト(`{}`)やシンボル(`Symbol()`)などglobalに同じ値が1つのみ存在しないものを値にする。(`{} === {}`は`false`になる。)
2. 文字列やグローバルシンボル(`Symbol.for('logger')`)のようにglobalに複数の同じ値が存在するものを値にする。(`'foo' === 'foo'`は`true`になる。)

2つの別の`createContext()`の結果を使って同じコンテキストを参照するには、下記のように文字列のように`===`で比較すると等価になる値を渡します。

```ts
// true
createContext('my-context') === createContext('my-context')
```

アプリケーション内にある2つのモジュールが同じコンテキストオブジェクトを使って意図せず異なるオブジェクトを参照する場合に注意してください。
この意図しない衝突を避けるために(`'logger'`の代わりに`'console-logger'`を使うように)ユニークな値を`createContext()`に渡した方が良いかもしれません。

通常、コンテキストオブジェクトの生成時に渡される値はglobalに同じ値が1つのみがベストです。
シンボル(`Symbol()`)を使うとこれが簡単にできます。

### 値をセットする

`@lit/context`にはコンテキストの値をセットする2つの方法があります。
それは`ContextProvider`コントローラと`@provide()`デコレータです。

#### `@provide()`デコレータ

デコレータが利用可能なら、`@provide()`デコレータはプロバイダに値をセットする最も簡単な方法です。
このデコレータは`ContextProvider`コントローラを生成します。

下記のように`@provide()`デコレータをプロパティに付与して、それにコンテキストオブジェクトを渡します。

```ts
import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';
import {provide} from '@lit/context';
import {myContext, MyData} from './my-context.js';

class MyApp extends LitElement {
  @provide({context: myContext})
  myData: MyData;
}
```

`@property()`もしくは`@state()`をセットしたプロパティはリアクティブプロパティになります。
だから、そのプロパティを更新すると、プロバイダが存在する要素と同じようにコンテキストコンシューマも更新されます。

```ts
  @provide({context: myContext})
  @property({attribute: false})
  myData: MyData;
```

コンテキストを取り扱うプロパティをprivateにすることはよくあります。
下記のように`@state()`を付与されたprivateなリアクティブプロパティをプロバイダにすることができます。

```ts
  @provide({context: myContext})
  @state()
  private _myData: MyData;
```

コンテキストを扱うプロパティをpublicと`@property()`にすると、下記のようにテンプレートで値をセットすることができます。

```ts
  html`<my-provider-element .myData=${someData}>`
```

#### ContextProvider

`ContextProvider`は`context-request`を取り扱うリアクティブコントローラです。

```ts
import {LitElement, html} from 'lit';
import {ContextProvider} from '@lit/context';
import {myContext} from './my-context.js';

export class MyApp extends LitElement {
  private _provider = new ContextProvider(this, {context: myContext});
}
```

下記のように`ContextProvider`のコンストラクタで初期値を指定することができます。

```ts
  private _provider = new ContextProvider(this, {context: myContext, initialValue: myData});
```

もしくは下記のように`setValue()`を使います。

```ts
  this._provider.setValue(myData);
```

### コンシューマ

#### `@consume()`デコレータ

デコレータが利用可能なら、`@consume()`デコレータは値を取得する最も簡単な方法です。
このデコレータは`ContextConsumer`コントローラを生成します。

下記のように`@consume`にコンテキストオブジェクトを渡します。

```ts
import {LitElement, html} from 'lit';
import {consume} from '@lit/context';
import {myContext, MyData} from './my-context.js';

class MyElement extends LitElement {
  @consume({context: myContext})
  myData: MyData;
}
```

上記の要素がdocumentに接続すると、
自動的に`context-request`イベントが発生します。
そして、その要素はプロバイダから提供された値を取得します。
その値は要素のプロパティにセットされます。
その要素の更新が発動されます。

#### ContextConsumer

`ContextConsumer`は`context-request`イベントのdispatchを取り扱うリアクティブコントローラです。
新しい値がプロバイダから提供されると、このコントローラはホストコンポーネントを更新します。
その提供された値はコントローラの`value`プロパティで使うことができます。

```ts
import {LitElement, property} from 'lit';
import {ContextConsumer} from '@lit/context';
import {myContext} from './my-context.js';

export class MyElement extends LitElement {
  private _myData = new ContextConsumer(this, {context: myContext});

  render() {
    const myData = this._myData.value;
    return html`...`;
  }
}
```

#### サブスクライブ

コンシューマはプロバイダに新しい値がセットされるタイミングで、コンテキストの値の更新をサブスクライブすることができます。
プロバイダはその値をサブスクライブしているすべてのコンシューマに渡します。
そして、それらのコンシューマのホストコンポーネントの更新を引き起こします。

サブスクライブを有効にするには、下記のように`@consume()`デコレータを設定します。

```ts
  @consume({context: myContext, subscribe: true})
  myData: MyData;
```

`@consume()`デコレータではなく`ContextConsumer`コントローラを使う場合は、下記のようにします。

```ts
  private _myData = new ContextConsumer(this,
    {
      context: myContext,
      subscribe: true,
    }
  );
```

## ユースケース

### ユーザデータ、ロケール等

もっとも一般的なコンテキストのユースケースはページに分散しているコンポーネントにデータを提供することです。
この場合、コンポーネントを使わないとほぼすべてのコンポーネントのリアクティブプロパティにデータを流通させることが必要になるかもしれません。

### サービス

コンテキストはロガー(logger)、ウェブ分析、データストアのようなアプリケーション全体で使われるサービスを提供することに適しています。
これらのサービスをモジュールにしてコンポーネントのファイルにimportするよりコンテキストを使う利点は、
実行時にサービスを動的に指定することができる点やDOMツリーごとにサービスを指定できる点です。
具体的には、テストではサービスのモックを使いやすいです。また、ページ内の異なる部分(コンポーネント)に異なるサービスインスタンスを渡すことができます。

### テーマ

テーマはページ全体もしくはページのサブツリー全体に適用されるスタイルの集合です。
これはコンテキストが提供するデータの適用範囲と同じです。

テーマシステムを構築する1つの方法はコンテナ要素に適用する`Theme`型を定義することです。
その型はスタイル名とスタイルで構成されてるオブジェクトです。
テーマを適用したい要素はテーマオブジェクトを取得して、それからスタイル名でスタイルを取得します。
ContextProviderとContextConsumerをラップしたカスタムテーマリアクティブコントローラを作成すると、繰り返し同じコードを書く量が減るでしょう。

### HTMLベースのプラグイン

コンテキストを使うと普通の子要素にデータを渡すことができます。
親コンポーネントが普通の子要素を生成しない場合、
親コンポーネントはテンプレートのデータバインディングを通じてデータを子要素に渡すことができません。
しかし、子要素は`context-request`イベントに応答することはできます。

例として、下記のようないろいろな言語モードのプラグインと一緒に使われる`code-editor`要素について考えてみましょう。
コンテキストを使うことで、素のHTMLの仕組みを使って機能を追加することができます。

```html
<code-editor>
  <code-editor-javascript-mode></code-editor-javascript-mode>
  <code-editor-python-mode></code-editor-python-mode>
</code-editor>
```

上記の場合、`code-editor`はコンテキストを経由して言語モードを追加するAPIをプラグインに提供します。
そして、プラグイン要素はAPIをconsumeして自身をエディタに追加します。

### データフォーマッタ、リンクジェネレータ等

再利用可能なコンポーネントでもアプリケーションを固有のデータフォーマットやURLのフォーマットに対応する必要がある場合があります。
For example, a documentation viewer that renders a link to another item.
The component will not know the URL space of the application.

In these cases the component can depend on a context-provided function that will apply the application-specific formatting to the data or link.

## API

<div class="alert alert-info">

These API docs are a summary until generated API docs are available

</div>

### `createContext()`

Creates a typed Context object

**Import**:

```ts
import {createContext} from '@lit/context';
```

**Signature**:

```ts
function createContext<ValueType, K = unknown>(key: K): Context<K, ValueType>;
```


Contexts are compared with with strict equality.

If you want two separate `createContext()` calls to referrer to the same context, then use a key that will by equal under strict equality like a string for `Symbol.for()`:

```ts
// true
createContext('my-context') === createContext('my-context')
// true
createContext(Symbol.for('my-context')) === createContext(Symbol.for('my-context'))
```

If you want a context to be unique so that it's guaranteed to not collide with other contexts, use a key that's unique under strict equality, like a `Symbol()` or object.:

```ts
// false
createContext(Symbol('my-context')) === createContext(Symbol('my-context'))
// false
createContext({}) === createContext({})
```

The `ValueType` type parameter is the type of value that can be provided by this context. It's uses to provide accurate types in the other context APIs.

### `@provide()`

A property decorator that adds a ContextConsumer controller to the component which will try and retrieve a value for the property via the Context API.

**Import**:

```ts
import {provide} from '@lit/context';
```

**Signature**:

```ts
@provide({context: Context})
```

### `@consume()`

A property decorator that adds a ContextConsumer controller to the component which will retrieve a value for the property via the Context protocol.

**Import**:

```ts
import {consume} from '@lit/context';
```

**Signature**:

```ts
@consume({context: Context, subscribe?: boolean})
```

`subscribe` is `false` by default. Set it to `true` to subscribe to updates to the context provided value.

### `ContextProvider`

A ReactiveController which adds context provider behavior to a custom element by listening to `context-request` events.

**Import**:

```ts
import {ContextProvider} from '@lit/context';
```

**Constructor**:

```ts
ContextProvider(
  host: ReactiveElement,
  options: {
    context: T,
    initialValue?: ContextType<T>
  }
)
```

**Members**

- `setValue(v: T, force = false): void`

    Sets the value provided, and notifies any subscribed consumers of the new value if the value changed. `force` causes a notification even if the value didn't change, which can be useful if an object had a deep property change.


### `ContextConsumer`

A ReactiveController which adds context consuming behavior to a custom element by dispatching `context-request` events.

**Import**:

```ts
import {ContextConsumer} from '@lit/context';
```

**Constructor**:
```ts
ContextConsumer(
  host: HostElement,
  options: {
    context: C,
    callback?: (value: ContextType<C>, dispose?: () => void) => void,
    subscribe?: boolean = false
  }
)
```

**Members**

- `value: ContextType<C>`

   The current value for the context.

When the host element is connected to the document it will emit a `context-request` event with its context key. When the context request is satisfied the controller will invoke the callback, if present, and trigger a host update so it can respond to the new value.

It will also call the dispose method given by the provider when the host element is disconnected.

### `ContextRoot`

A ContextRoot can be used to gather unsatisfied context requests and re-dispatch them when new providers which satisfy matching context keys are available. This allows providers to be added to a DOM tree, or upgraded, after the consumers.

**Import**:

```ts
import {ContextRoot} from '@lit/context';
```

**Constructor**:
```ts
ContextRoot()
```

**Members**

- `attach(element: HTMLElement): void`

    Attaches the ContextRoot to this element and starts listening to `context-request` events.

- `detach(element: HTMLElement): void`

    Detaches the ContextRoot from this element, stops listening to `context-request` events.

### `ContextRequestEvent`

The event fired by consumers to request a context value. The API and behavior of this event is specified by the [Context Protocol](https://github.com/webcomponents-cg/community-protocols/blob/main/proposals/context.md).

**Import**:

```ts
import {ContextRequestEvent} from '@lit/context';
```

The `context-request` bubbles and is composed.

**Members**

- `readonly context: C`

    The context object this event is requesting a value for

- `readonly callback: ContextCallback<ContextType<C>>`

    The function to call to provide a context value

- `readonly subscribe?: boolean`

    Whether the consumers wants to subscribe to new context values

### `ContextCallback`

A callback which is provided by a context requester and is called with the value satisfying the request.

This callback can be called multiple times by context providers as the requested value is changed.

**Import**:

```ts
import {type ContextCallback} from '@lit/context';
```

**Signature**:

```ts
type ContextCallback<ValueType> = (
  value: ValueType,
  unsubscribe?: () => void
) => void;
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