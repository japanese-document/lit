{ "header": {"name": "組み合わせ", "order": 2}, "order": 0 }
---
# リアクティブコントローラ

Lit2はリアクティブコントローラというコードの再利用と構成のための新しいコンセプトを導入しました。

リアクティブコントローラを使うと、コンポーネントにリアクティブアップデートサイクルに対するフックを加えることができます。
そして、コンポーネントに追加する機能に必要な動作とステートをひとまとめにして、それを複数のコンポーネントの定義で共用することができます。

```ts
import {LitElement, html, ReactiveController, ReactiveControllerHost} from 'lit';
import {customElement} from 'lit/decorators.js';

export class ClockController implements ReactiveController {
  host: ReactiveControllerHost;

  value = new Date();
  timeout: number;
  private _timerID?: number;

  constructor(host: ReactiveControllerHost, timeout = 1000) {
    (this.host = host).addController(this);
    this.timeout = timeout;
  }
  hostConnected() {
    // コンポーネントがDOMツリーに接続された時、タイマーがスタートする。
    this._timerID = setInterval(() => {
      this.value = new Date();
      // 新しい値をコンポーネントに反映する。
      this.host.requestUpdate();
    }, this.timeout);
  }
  hostDisconnected() {
    // コンポーネントがDOMツリーから切断された時、タイマーをクリアする。
    clearInterval(this._timerID);
    this._timerID = undefined;
  }
}

@customElement('my-element')
class MyElement extends LitElement {
  // コントローラを生成してそれを格納する。
  private clock = new ClockController(this, 100);

  // render()内でコントローラを使う。
  render() {
    const formattedTime = timeFormat.format(this.clock.value);
    return html`Current time: ${formattedTime}`;
  }
}

const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: 'numeric', second: 'numeric',
});
```

コントローラはクラスのミックスインとよく似ています。
The main difference is that they have their own identity and don't add to the component's prototype,
which helps contain their APIs and lets you use multiple controller instances per host component.
詳しくは[コントローラとミックスイン](https://lit.dev/docs/composition/overview/#controllers-and-mixins)を見てください。

## コントローラを使う

以下のようにコントローラを生成します。通常、コントローラのインスタンスはコンポーネント内で生成され格納されます。

```ts
class MyElement extends LitElement {
  private clock = new ClockController(this, 1000);
}
```

コントローラに結びつけられたコンポーネントのことを **ホストコンポーネント** と呼びます。

コントローラインスタンスはホストコンポーネントのライフサイクルを受信したり、ホストコンポーネントを更新してデータを反映するためにホストコンポーネントに登録されます。
`ClockController`の例では、これを行うことで現在の時刻を更新しています。

通常、コントローラはホストコンポーネントの`render()`メソッド内で使われる値を提供します。
例えば以下のような現在の日時を表す値です。

```ts
  render() {
    return html`
      <div>Current time: ${this.clock.value}</div>
    `;
  }
```

コントローラのAPIの仕様に関しては[こちら](https://lit.dev/docs/api/controllers/)を見てください。

## コントローラを実装する

リアクティブコントローラはホストコンポーネントに結びつけられるオブジェクトです。
リアクティブコントローラには1つ以上のホストライフサイクルコールバックもしくはホストコンポーネントを操作する処理を実装します。
リアクティブコントローラを実装する方法はいろいろありますが、
ここではクラスを使ってコンストラクタで初期化処理を行ってメソッドでライフサイクルを実装します。

### コントローラの初期化

`host.addController(this)`でコントローラをホストコンポーネントに登録します。
通常、コントローラはホストコンポーネントを操作するためにホストコンポーネントの参照を保持します。

```ts
class ClockController implements ReactiveController {
  private host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    // ホストコンポーネントを保持する。
    this.host = host;
    // コントローラをホストコンポーネントに結びつける。
    host.addController(this);
  }
}
```

下記のように、ホストコンポーネント以外のコンストラクタの引数を使って設定を追加することができます。

```ts
class ClockController implements ReactiveController {
  private host: ReactiveControllerHost;
  timeout: number

  constructor(host: ReactiveControllerHost, timeout: number) {
    this.host = host;
    this.timeout = timeout;
    host.addController(this);
  }
```

コントローラをホストコンポーネントに登録すると、
コントローラに実装したホストコンポーネントに対するライフサイクルコールバックが有効になります。

### ライフサイクル

[ReactiveController](https://lit.dev/docs/api/controllers/#ReactiveController)インターフェイスで定義されているリアクティブコントローラライフサイクルメソッドはリアクティブアップデートライフサイクルのサブセットです。
LitElementはそのライフサイクルイベントの際、結びつけられているコントローラのリアクティブコントローラライフサイクルメソッドを実行します。
リアクティブコントローラライフサイクルメソッドの実装はオプションです。

* `hostConnected()`:
  * ホストコンポーネントがDOMツリーに接続した時に実行されます。
  * `renderRoot`が生成された後に実行されるので、この時点でshadow rootは存在しています。
  * イベントリスナやオブザーバをセットすることに使用します。
* `hostUpdate()`:
  * ホストコンポーネントの`update()`メソッドと`render()`メソッドを実行する前に実行されます。
  * 更新前にDOMを読む処理に使用します。
* `hostUpdated()`:
  * ホストコンポーネントが更新した後で`updated()`メソッドが実行する前に実行されます。
  * 更新後にDOMを読む処理に使用します。
* `hostDisconnected()`:
  * ホストコンポーネントがDOMツリーから離れた時に実行されます。
  * イベントリスナやオブザーバのような`hostConnected()`で追加した処理を削除することに使用します。

詳しくは[リアクティブアップデートサイクル](https://japanese-document.github.io/lit/components-lifecycle.html#リアクティブアップデートサイクル)を見てください。

### ReactiveControllerHost API

リアクティブコントローラホストはコントローラを追加して更新をリクエストする小さいAPIを持ちます。
そして、結びついたコントローラのライフサイクルメソッドを実行します。

以下にリアクティブコントローラホストのAPIを簡潔に示します。

* `addController(controller: ReactiveController)`
* `removeController(controller: ReactiveController)`
* `requestUpdate()`
* `updateComplete: Promise<boolean>`

[ReactiveControllerHost](https://lit.dev/docs/api/controllers/#ReactiveControllerHost)型だけではなく`HTMLElement`、`ReactiveElement`、`LitElement`をコントローラと結びつけることもできます。それだけてはなく、コントローラをcustom elementsや他のインターフェイスと結びつけることもできます。

### コントローラを組み合わせてコントローラを生成する

コントローラを組み合わせてコントローラを定義することができます。
下記のように子コントローラにホストコンポーネントを渡します。

```ts
class DualClockController implements ReactiveController {
  private clock1: ClockController;
  private clock2: ClockController;

  constructor(host: ReactiveControllerHost, delay1: number, delay2: number) {
    this.clock1 = new ClockController(host, delay1);
    this.clock2 = new ClockController(host, delay2);
  }

  get time1() { return this.clock1.value; }
  get time2() { return this.clock2.value; }
}
```

### コントローラとディレクティブ

Combining controllers with directives can be a very powerful technique, especially for directives that need to do work before or after rendering, like animation directives; or controllers that need references to specific elements in a template.

There are two main patterns of using controllers with directives:

* Controller directives. These are directives that themselves are controllers in order to hook into the host lifecycle.
* Controllers that own directives. These are controllers that create one or more directives for use in the host's template.

詳しくは[カスタムディレクティブ](https://lit.dev/docs/templates/custom-directives/)を見てください。

#### Controller directives

Reactive controllers do not need to be stored as instance fields on the host. Anything added to a host using `addController()` is a controller. In particular, a directive can also be a controller. This enables a directive to hook into the host lifecycle.

#### Controllers that own directives

Directives do not need to be standalone functions, they can be methods on other objects as well, such as controllers. This can be useful in cases where a controller needs a specific reference to an element in a template.

For example, imagine a ResizeController that lets you observe an element's size with a ResizeObserver. To work we need both a ResizeController instance, and a directive that is placed on the element we want to observe:

```ts
class MyElement extends LitElement {
  private _textSize = new ResizeController(this);

  render() {
    return html`
      <textarea ${this._textSize.observe()}></textarea>
      <p>The width is ${this._textSize.contentRect?.width}</p>
    `;
  }
}
```

To implement this, you create a directive and call it from a method:

```ts
class ResizeDirective {
  /* ... */
}
const resizeDirective = directive(ResizeDirective);

export class ResizeController {
  /* ... */
  observe() {
    // Pass a reference to the controller so the directive can
    // notify the controller on size changes.
    return resizeDirective(this);
  }
}
```

## Use cases

Reactive controllers are very general and have a very broad set of possible use cases. They are particularly good for connecting a component to an external resource, like user input, state management, or remote APIs. Here are a few common use cases.

### External inputs

Reactive controllers can be used to connect to external inputs. For example, keyboard and mouse events, resize observers, or mutation observers. The controller can provide the current value of the input to use in rendering, and request a host update when the value changes.

#### Example: MouseMoveController

This example shows how a controller can perform setup and cleanup work when its host is connected and disconnected, and request an update when an input changes:

{% playground-ide "docs/controllers/mouse" "my-element.ts" %}

### Asynchronous tasks

Asynchronous tasks, such as long running computations or network I/O, typically have state that changes over time, and will need to notify the host when the task state changes (completes, errors, etc.).

Controllers are a great way to bundle task execution and state to make it easy to use inside a component. A task written as a controller usually has inputs that a host can set, and outputs that a host can render.

`@lit-labs/task` contains a generic `Task` controller that can pull inputs from the host, execute a task function, and render different templates depending on the task state.

You can use `Task` to create a custom controller with an API tailored for your specific task. Here we wrap `Task` in a `NamesController` that can fetch one of a specified list of names from a demo REST API. `NameController` exposes a `kind` property as an input, and a `render()` method that can render one of four templates depending on the task state. The task logic, and how it updates the host, are abstracted from the host component.

{% playground-ide "docs/controllers/names" %}

## See also

* [Reactive update cycle](/docs/v2/components/lifecycle/#reactive-update-cycle)
* [@lit-labs/task](https://www.npmjs.com/package/@lit-labs/task)

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