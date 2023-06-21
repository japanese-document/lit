{ "header": {"name": "テンプレート", "order": 1}, "order": 2 }
---
# カスタムディレクティブ

ディレクティブはテンプレートエクスプレッションをレンダリングする方法を変更することによってLitを拡張する関数です。
ディレクティブはステートを持つことができて、DOMにアクセスすることができて、テンプレートがDOMツリーに接続/切断されたことを検知することができて、レンダリング関数外から独立してエクスプレッションを更新することができます。だから、便利で応用範囲が広いです。

下記のように、テンプレートのエクスプレッションでディレクティブを使うことは関数を実行することと同じくらいシンプルです。

```js
html`<div>
       ${fancyDirective('some text')}
     </div>`
```

Litは[`repeat()`](https://japanese-document.github.io/lit/templates-directives.html#repeat)と[`cache()`](https://japanese-document.github.io/lit/templates-directives.html#cache)のような[ビルトインディレクティブ](https://japanese-document.github.io/lit/templates-directives.html)を用意しています。
カスタムディレクティブを作成することもできます。

ディレクティブは下記の2種類あります。

-   関数ディレクティブ
-   クラスディレクティブ

関数ディレクティブは下記のようにレンダリングする値を返します。
関数ディレクティブは任意の引数を受け取ることができます。

```js
export noVowels = (str) => str.replaceAll(/[aeiou]/ig,'x');
```

クラスディレクティブを使うと関数ディレクティブではできないことができるようになります。
クラスディレクティブは下記の用途で使用します。

- 直接レンダリングされたDOMにアクセスします。(例: レンダリングされたDOMを追加、削除、並べ替える)
- レンダリング間でステートを保持します。
- レンダリングの実行外でDOMを非同期で更新します。
- ディレクティブがDOMから切断される時にリソースをクリーンアップします。

ここからはクラスディレクティブについて解説します。

## クラスディレクティブを生成する

下記の手順でクラスディレクティブを実装します。

* [Directive](https://lit.dev/docs/api/custom-directives/#Directive)クラスを継承したクラスを実装します。
* そのクラスを`directive()`に渡してテンプレートのエクスプレッションで使うことができるディレクティブ関数を生成します。

```js
import {Directive, directive} from 'lit/directive.js';

// ディレクティブを定義します。
class HelloDirective extends Directive {
  render() {
    return `Hello!`;
  }
}
// ディレクティブ関数を生成します。
const hello = directive(HelloDirective);

// ディレクティブを使いします。
const template = html`<div>${hello()}</div>`;
```

上記のテンプレートが評価される時、
ディレクティブ関数(`hello()`)は`DirectiveResult`オブジェクトを返します。
`DirectiveResult`オブジェクトはLitにクラスディレクティブ(`HelloDirective`)を生成もしくは更新するように命令します。
それから、Litはクラスディレクティブインスタンスのメソッドでその更新ロジックを実行します。

ディレクティブで通常の更新サイクル外でDOMを非同期に更新したい時があります。
非同期ディレクティブを生成するには、ベースクラスを`Directive`の代わりに`AsyncDirective`にします。
詳しくは[非同期ディレクティブ](#非同期ディレクティブ)を見てください。

## クラスディレクティブのライフサイクル

クラスディレクティブは下記のビルトインライフサイクルメソッドを持ちます。

* コンストラクタで1回だけの初期化をします。
* `render()`で宣言的レンダリングをします。
* `update()`で命令的DOMアクセスをします。

クラスディレクティブでは`render()`を実装することは必須です。
`update()`はオプションです。
デフォルトの`update()`の実装は`render()`を実行してその値を返します。

非同期ディレクティブを使うと、通常の更新サイクル外でDOMを更新することができます。
非同期ディレクティブには上記以外のライフサイクルメソッドが存在します。
詳しくは[非同期ディレクティブ](#非同期ディレクティブ)を見てください。

### 1回だけ設定する: constructor()

Litが最初にエクスプレッション内の`DirectiveResult`を評価する時、
対応するクラスディレクティブのインスタンスを生成します。
(クラスディレクティブのコンストラクタを実行して、クラスフィールドを初期化します。)

```ts
class MyDirective extends Directive {
  // クラスフィールドは1回だけ初期化されます。これはレンダリング間で保持されます。
  value = 0;
  // コンストラクタはエクスプレッション内で使われるディレクティブで初回のみ実行されます。
  constructor(partInfo: PartInfo) {
    super(partInfo);
    console.log('MyDirective created');
  }
  ...
}
```

レンダー毎に同じエクスプレッションに同じディレクティブ関数を配置する限り、
1つ前のクラスディレクティブのインスタンスを再び使います。
そして、レンダリング間でクラスディレクティブのインスタンスのステートは保持されます。

コンストラクタは`PartInfo`オブジェクトを引数に取ります。
その`PartInfo`オブジェクトはディレクティブが使われているエクスプレッションに関するメタデータを含んでいます。
これは使用されるエクスプレッションの種類を限定しているディレクティブがそれをチェックする際に利用することができます。
詳しくは[ディレクティブを使用することができるエクスプレッションの種類を1つに制限する](#ディレクティブを使用することができるエクスプレッションの種類を1つに制限する)を見てください。

### ディレクティブのレンダリング: render()

`render()`メソッドはDOMにレンダリングする値を返す必要があります。
`render()`メソッドは`DirectiveResult`のようなレンダリング可能な値を返すこともできます。

下記のように`render()`はディレクティブインスタンスのステートを参照できるだけではなく、
`render()`メソッドはディレクティブ関数に渡された引数を引数として受け取ります。

```js
const template = html`<div>${myDirective(name, rank)}</div>`
```

`render()`メソッドのパラメータの定義はディレクティブ関数のパラメータの定義になります。

```ts
class MaxDirective extends Directive {
  maxValue = Number.MIN_VALUE;
  // 下記のような引数を持つrender関数を定義します。
  render(value: number, minValue = Number.MIN_VALUE) {
    this.maxValue = Math.max(value, this.maxValue, minValue);
    return this.maxValue;
  }
}
const max = directive(MaxDirective);

// `render()`で定義されている`value`および`minValue`引数をディレクティブ関数に渡して実行します。
const template = html`<div>${max(someNumber, 0)}</div>`;
```

### 命令的DOMアクセス: update()

ディレクティブでディレクティブが配置されているDOMにアクセスして命令的にそれを読んだり変更したりする必要がある場合があるかもしれません。
`update()`メソッドをオーバーライドすればそれができます。

`update()`メソッドは下記の2つの引数を受け取ります。

* エクスプレッションに関連しているDOMを直接管理するためのAPIを持つ`Part`オブジェクト
* `render()`の引数を含む配列

`update()`メソッドはLitがレンダリング可能な値を返す必要があります。もしくは、再レンダリングの必要がない場合は[`noChange`](https://lit.dev/docs/templates/custom-directives/#signaling-no-change)を返します。
通常、`update()`メソッドは次の処理を行います。

- DOMからデータを取得して、それを使ってレンダリングする値を生成します。
- `Part`オブジェクトの`element`もしくは`parentNode`プロパティを操作してDOMを命令的に更新します。
通常、この場合は、ディレクティブをレンダリングするために何もする必要がないことをLitに通知するために`update()`は`noChange`を返します。

#### Part

`Part`オブジェクトはエクスプレッションの位置に対応する`Part`オブジェクトになります。

* HTMLの子要素の位置にあるエクスプレッションでは[ChildPart](https://lit.dev/docs/api/custom-directives/#ChildPart)です。
*   {% api "AttributePart" %} for expressions in HTML attribute value position.
*   {% api "BooleanAttributePart" %} for expressions in a boolean attribute value (name prefixed with `?`).
*   {% api "EventPart" %} for expressions in an event listener position (name prefixed with `@`).
*   {% api "PropertyPart" %} for expressions in property value position (name prefixed with `.`).
*   {% api "ElementPart" %} for expressions on the element tag.

In addition to the part-specific metadata contained in `PartInfo`, all `Part` types provide access to the DOM `element` associated with the expression (or `parentNode`, in the case of `ChildPart`), which may be directly accessed in `update()`. For example:

```ts
// Renders attribute names of parent element to textContent
class AttributeLogger extends Directive {
  attributeNames = '';
  update(part: ChildPart) {
    this.attributeNames = (part.parentNode as Element).getAttributeNames?.().join(' ');
    return this.render();
  }
  render() {
    return this.attributeNames;
  }
}
const attributeLogger = directive(AttributeLogger);

const template = html`<div a b>${attributeLogger()}</div>`;
// Renders: `<div a b>a b</div>`
```

In addition, the `directive-helpers.js` module includes a number of helper functions which act on `Part` objects, and can be used to dynamically create, insert, and move parts within a directive's `ChildPart`.

#### Calling render() from update()

The default implementation of `update()` simply calls and returns the value from `render()`. If you override `update()` and still want to call `render()` to generate a value, you need to call `render()` explicitly.

The `render()` arguments are passed into `update()` as an array. You can pass the arguments to `render()` like this:

```ts
class MyDirective extends Directive {
  update(part: Part, [fish, bananas]: DirectiveParameters<this>) {
    // ...
    return this.render(fish, bananas);
  }
  render(fish: number, bananas: number) { ... }
}
```

### Differences between update() and render()

While the `update()` callback is more powerful than the `render()` callback, there is an important distinction: When using the `@lit-labs/ssr` package for server-side rendering (SSR), _only_ the `render()` method is called on the server. To be compatible with SSR, directives should return values from `render()` and only use `update()` for logic that requires access to the DOM.

## Signaling no change

Sometimes a directive may have nothing new for Lit to render. You signal this by returning `noChange` from the `update()` or `render()` method. This is different from returning `undefined`, which causes Lit to clear the `Part` associated with the directive. Returning `noChange` leaves the previously rendered value in place.

There are several common reasons for returning `noChange`:

*   Based on the input values, there's nothing new to render.
*   The `update()` method updated the DOM imperatively.
*   In an async directive, a call to `update()` or `render()` may return `noChange` because there's nothing to render _yet_.

For example, a directive can keep track of the previous values passed in to it, and perform its own dirty checking to determine whether the directive's output needs to be updated. The `update()` or `render()` method can return `noChange`  to signal that the directive's output doesn't need to be re-rendered.

{% switchable-sample %}

```ts
import {Directive} from 'lit/directive.js';
import {noChange} from 'lit';
class CalculateDiff extends Directive {
  a?: string;
  b?: string;
  render(a: string, b: string) {
    if (this.a !== a || this.b !== b) {
      this.a = a;
      this.b = b;
      // Expensive & fancy text diffing algorithm
      return calculateDiff(a, b);
    }
    return noChange;
  }
}
```

```js
import {Directive} from 'lit/directive.js';
import {noChange} from 'lit';
class CalculateDiff extends Directive {
  render(a, b) {
    if (this.a !== a || this.b !== b) {
      this.a = a;
      this.b = b;
      // Expensive & fancy text diffing algorithm
      return calculateDiff(a, b);
    }
    return noChange;
  }
}
```

{% endswitchable-sample %}

## ディレクティブを使用することができるエクスプレッションの種類を1つに制限する

Some directives are only useful in one context, such as an attribute expression or a child expression. If placed in the wrong context, the directive should throw an appropriate error.

For example, the `classMap` directive validates that it is only used in an `AttributePart` and only for the `class` attribute`:

{% switchable-sample %}

```ts
class ClassMap extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo);
    if (
      partInfo.type !== PartType.ATTRIBUTE ||
      partInfo.name !== 'class'
    ) {
      throw new Error('The `classMap` directive must be used in the `class` attribute');
    }
  }
  ...
}
```

```js
class ClassMap extends Directive {
  constructor(partInfo) {
    super(partInfo);
    if (
      partInfo.type !== PartType.ATTRIBUTE ||
      partInfo.name !== 'class'
    ) {
      throw new Error('The `classMap` directive must be used in the `class` attribute');
    }
  }
  ...
}
```

{% endswitchable-sample %}

## 非同期ディレクティブ

The previous example directives are synchronous: they return values synchronously from their `render()`/`update()` lifecycle callbacks, so their results are written to the DOM during the component's `update()` callback.

Sometimes, you want a directive to be able to update the DOM asynchronously—for example, if it depends on an asynchronous event like a network request.

To update a directive's result asynchronously, a directive needs to extend the {% api "AsyncDirective" %} base class, which provides a `setValue()` API. `setValue()` allows a directive to "push" a new value into its template expression, outside of the template's normal `update`/`render` cycle.

Here's an example of a simple async directive that renders a Promise value:

{% switchable-sample %}

```ts
class ResolvePromise extends AsyncDirective {
  render(promise: Promise<unknown>) {
    Promise.resolve(promise).then((resolvedValue) => {
      // Rendered asynchronously:
      this.setValue(resolvedValue);
    });
    // Rendered synchronously:
    return `Waiting for promise to resolve`;
  }
}
export const resolvePromise = directive(ResolvePromise);
```

```js
class ResolvePromise extends AsyncDirective {
  render(promise) {
    Promise.resolve(promise).then((resolvedValue) => {
      // Rendered asynchronously:
      this.setValue(resolvedValue);
    });
    // Rendered synchronously:
    return `Waiting for promise to resolve`;
  }
}
export const resolvePromise = directive(ResolvePromise);
```

{% endswitchable-sample %}

Here, the rendered template shows "Waiting for promise to resolve," followed by the resolved value of the promise, whenever it resolves.

Async directives often need to subscribe to external resources. To prevent memory leaks async directives should unsubscribe or dispose of resources when the directive instance is no longer in use.  For this purpose, `AsyncDirective` provides the following extra lifecycle callbacks and API:

* `disconnected()`: Called when a directive is no longer in use.  Directive instances are disconnected in three cases:
  - When the DOM tree the directive is contained in is removed from the DOM
  - When the directive's host element is disconnected
  - When the expression that produced the directive no longer resolves to the same directive.

  After a directive receives a `disconnected` callback, it should release all resources it may have subscribed to during `update` or `render` to prevent memory leaks.

* `reconnected()`: Called when a previously disconnected directive is being returned to use. Because DOM subtrees can be temporarily disconnected and then reconnected again later, a disconnected directive may need to react to being reconnected. Examples of this include when DOM is removed and cached for later use, or when a host element is moved causing a disconnection and reconnection. The `reconnected()` callback should always be implemented alongside `disconnected()`, in order to restore a disconnected directive back to its working state.

* `isConnected`: Reflects the current connection state of the directive.

<div class="alert alert-info">

Note that it is possible for an `AsyncDirective` to continue receiving updates while it is disconnected if its containing tree is re-rendered. Because of this, `update` and/or `render` should always check the `this.isConnected` flag before subscribing to any long-held resources to prevent memory leaks.

</div>

Below is an example of a directive that subscribes to an `Observable` and handles disconnection and reconnection appropriately:

{% switchable-sample %}

```ts
class ObserveDirective extends AsyncDirective {
  observable: Observable<unknown> | undefined;
  unsubscribe: (() => void) | undefined;
  // When the observable changes, unsubscribe to the old one and
  // subscribe to the new one
  render(observable: Observable<unknown>) {
    if (this.observable !== observable) {
      this.unsubscribe?.();
      this.observable = observable
      if (this.isConnected)  {
        this.subscribe(observable);
      }
    }
    return noChange;
  }
  // Subscribes to the observable, calling the directive's asynchronous
  // setValue API each time the value changes
  subscribe(observable: Observable<unknown>) {
    this.unsubscribe = observable.subscribe((v: unknown) => {
      this.setValue(v);
    });
  }
  // When the directive is disconnected from the DOM, unsubscribe to ensure
  // the directive instance can be garbage collected
  disconnected() {
    this.unsubscribe!();
  }
  // If the subtree the directive is in was disconnected and subsequently
  // re-connected, re-subscribe to make the directive operable again
  reconnected() {
    this.subscribe(this.observable!);
  }
}
export const observe = directive(ObserveDirective);
```

```js
class ObserveDirective extends AsyncDirective {
  // When the observable changes, unsubscribe to the old one and
  // subscribe to the new one
  render(observable) {
    if (this.observable !== observable) {
      this.unsubscribe?.();
      this.observable = observable
      if (this.isConnected)  {
        this.subscribe(observable);
      }
    }
    return noChange;
  }
  // Subscribes to the observable, calling the directive's asynchronous
  // setValue API each time the value changes
  subscribe(observable) {
    this.unsubscribe = observable.subscribe((v) => {
      this.setValue(v);
    });
  }
  // When the directive is disconnected from the DOM, unsubscribe to ensure
  // the directive instance can be garbage collected
  disconnected() {
    this.unsubscribe();
  }
  // If the subtree the directive is in was disconneted and subsequently
  // re-connected, re-subscribe to make the directive operable again
  reconnected() {
    this.subscribe(this.observable);
  }
}
export const observe = directive(ObserveDirective);
```

{% endswitchable-sample %}

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