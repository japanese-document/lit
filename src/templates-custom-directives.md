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
* HTMLの属性の値の位置にあるエクスプレッションでは[AttributePart](https://lit.dev/docs/api/custom-directives/#AttributePart)です。
* 真偽値(属性名の接頭辞が`?`)の値の位置にあるエクスプレッションでは[BooleanAttributePart](https://lit.dev/docs/api/custom-directives/#BooleanAttributePart)です。
* イベントリスナ(属性名の接頭辞が`@`)の値の位置にあるエクスプレッションでは[EventPart](https://lit.dev/docs/api/custom-directives/#EventPart)です。
* プロパティ(属性名の接頭辞が`.`)の値の位置にあるエクスプレッションでは[PropertyPart](https://lit.dev/docs/api/custom-directives/#PropertyPart)です。
* HTMLタグ内にあるエクスプレッションでは[ElementPart](https://lit.dev/docs/api/custom-directives/#ElementPart)です。

コンストラクタの引数である`PartInfo`に格納されているエクスプレッションが配置されている位置のメタデータに加えて、
`update()`メソッドでは、すべての`Part`オブジェクトはエクスプレッションに関連したDOM(`element`もしくは`parentElement`)にアクセスすることができます。

```ts
// 属性名のリストを親要素のtextContentにレンダリングします。
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
// `<div a b>a b</div>`
```

In addition, the `directive-helpers.js` module includes a number of helper functions which act on `Part` objects, and can be used to dynamically create, insert, and move parts within a directive's `ChildPart`.

#### update()内でrender()を実行する

デフォルトの`update()`の実装は単に`render()`の戻り値を返すだけです。
`update()`をオーバーライドしても値の生成に`render()`を使って値を生成したい場合、`update()`内で`render()`を実行する必要があります。

`render()`の引数は配列で`update()`に引数として渡されます。
その`render()`の引数は下記の様に定義します。

```ts
class MyDirective extends Directive {
  update(part: Part, [fish, bananas]: DirectiveParameters<this>) {
    // ...
    return this.render(fish, bananas);
  }
  render(fish: number, bananas: number) { ... }
}
```

### update()とrender()の違い

`update()`メソッドは`render()`メソッドよりできることが多いですが、
注意すべき点があります。
それは`@lit-labs/ssr`パッケージをサーバーサイドレンダリング(SSR)に使う際、サーバでは`render()`メソッドのみが実行される点です。
SSRとの互換性のために、
ディレクティブは`render()`で値を返して、`update()`はDOMにアクセスする必要がある場合のみ使用してください。

## 変更がないことを伝える

ディレクティブのレンダリングをスキップして欲しい場合があるでしょう。
その場合は`update()`メソッドもしくは`render()`メソッドで`noChange`を返します。
`undefined`を返すとディレクティブに関連した`Part`をクリアされます。
`noChange`を返すとレンダリング結果の変更をスキップされます。

下記は`noChange`を使う動機です。

* 入力値に基づいたレンダリング結果に変更が無い。
* `update()`メソッド内でDOMを命令的に更新した。
* 非同期ディレクティブで何もレンダリングしないので`update()`や`render()`で`noChange`を返す。

下記の例では、
ディレクティブは前に渡された値を保持して、
それを使って変更を検知してディレクティブのレンダリング結果を更新する必要があるか判断しています。
`update()`もしくは`render()`は`noChange`を返すことでディレクティブの再レンダリングが必要ないことを示すことができます。

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
      // 高コストのテキスト差分アルゴリズム
      return calculateDiff(a, b);
    }
    return noChange;
  }
}
```

## ディレクティブを使用することができるエクスプレッションの種類を1つに制限する

ディレクティブの中には特定のコンテキスト(attribute expressionやchild expression等)でのみ使える物があります。
そのディレクティブが不適切な位置に配置された場合は適切なエラーを発生させるべきです。

下記の例では`classMap`ディレクティブは`class`属性の値の位置にのみに配置を制限しています。

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

## 非同期ディレクティブ

これまでの例ではディレクティブは同期的に動作します。
それらのディレクティブはそれらの`render()`/`update()`メソッドから同期的に値を返します。
その値はコンポーネントの`update()`メソッドでDOMに反映されます。

ディレクティブのDOMの更新がネットワークイベントのような非同期のイベントに依存している場合、DOMを非同期で更新したいでしょう。

ディレクティブを非同期で更新するには、
[AsyncDirective](https://lit.dev/docs/api/custom-directives/#AsyncDirective)を継承します。
`AsyncDirective`は`setValue()` APIを提供します。
`setValue()`を使うと通常のテンプレートの`update`/`render`サイクル外でディレクティブがテンプレートエクスプレッションで新しい値に置き換えることができます。

下記はPromiseの結果をレンダリングする簡単な非同期ディレクティブの例です。

```ts
import { directive } from 'lit/directive.js';
import { AsyncDirective } from 'lit/async-directive.js';

class ResolvePromise extends AsyncDirective {
  render(promise: Promise<unknown>) {
    Promise.resolve(promise).then((resolvedValue) => {
      // 非同期でレンダリングされます。
      this.setValue(resolvedValue);
    });
    // 同期でレンダリングされます。
    return `Waiting for promise to resolve`;
  }
}
export const resolvePromise = directive(ResolvePromise);
```

上記の例では、レンダリングされたテンプレートにWaiting for promise to resolveが表示されます。その後、Promiseが解決されるとPromiseが解決した値が表示されます。

非同期ディレクティブは外部リソースをsubscribeする用途によく使われます。
メモリーリークを防ぐために、
非同期ディレクティブのインスタンスが不要になった時にunsubscribeするかリソースを破棄する必要があります。
For this purpose, `AsyncDirective` provides the following extra lifecycle callbacks and API:

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