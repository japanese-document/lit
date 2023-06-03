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

[ReactiveController](https://lit.dev/docs/api/controllers/#ReactiveController)型のリアクティブコントローラライフサイクルメソッドはリアクティブアップデートライフサイクルのサブセットです。
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

コントローラとディレクティブを組み合わせることはとても応用範囲が広いテクニックです。
特にアニメーションディレクティブようなレンダリングの前後で動作が必要なディレクティブや
テンプレート内の特定の要素を参照する必要があるコントローラです。

コントローラとディレクティブを組み合わせて使うパターンは主に下記の2つです。

* コントローラディレクティブ。これはディレクティブ自身がホストコンポーネントのライフサイクルをフックするコントローラであるディレクティブです。
* ディレクティブを持つコントローラ。これはホストコンポーネントのテンプレート内で使用する1つ以上のディレクティブを生成します。

詳しくは[カスタムディレクティブ](https://lit.dev/docs/templates/custom-directives/)を見てください。

#### コントローラディレクティブ

リアクティブコントローラはホストコンポーネントのフィールドに格納する必要はありません。
ホストコンポーネントの`addController()`で結びつけられるものがコントローラです。
ディレクティブはコントローラにすることができます。
ディレクティブをコントローラにするとディレクティブはホストコンポーネントのライフサイクルにフックすることが可能になります。

#### ディレクティブを持つコントローラ

ディレクティブは単独の関数である必要はありません。
コントローラのようなオブジェクトのメソッドでも可能です。
これはコントローラがテンプレート内の特定の要素を産量する必要がある場合で使います。

例えば、[ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)を使って要素の大きさを監視する(observe)`ResizeController`を想像してください。
それには下記のような`ResizeController`インスタンスと監視したい要素上に配置されるディレクティブが必要です。


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

これを実現するために下記のようにディレクティブを作成してそれをメソッドから実行します。

```ts
class ResizeDirective {
  /* ... */
}
const resizeDirective = directive(ResizeDirective);

export class ResizeController {
  /* ... */
  observe() {
    // サイズの変更をディレクティブがコントローラに通知するためにコントローラの参照をディレクティブに渡します。
    return resizeDirective(this);
  }
}
```

## ユースケース

リアクティブコントローラの用途は多岐にわたります。
リアクティブコントローラはユーザ入力やステートマネジメントやリモートAPIのような外部リソースをコンポーネントに接続する良い方法です。
次に一般的なユースケースを示します。

### 外部入力

リアクティブコントローラは外部入力に接続することに使うことができます。
外部入力の例はキーボードイベントやマウスイベント、[リサイズオブザーバ](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)、[ミューテーションオブザーバ](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)があります。
コントローラはレンダリング時に現在の入力値を用意して、入力値が変わるとホストコンポーネントを更新することができます。

#### 例: MouseMoveController

下記の例はホストコンポーネントがDOMツリーに接続したり切断した時にコントローラがセットアップしたりクリーンアップする方法と入力値が変更した時に更新する方法を説明しています。

```ts
import {LitElement, html, ReactiveControllerHost} from 'lit';
import {customElement} from 'lit/decorators.js';
import {MouseController} from './mouse-controller.js';

export class MouseController {
  private host: ReactiveControllerHost;
  pos = {x: 0, y: 0};

  _onMouseMove = ({clientX, clientY}: MouseEvent) => {
    this.pos = {x: clientX, y: clientY};
    this.host.requestUpdate();
  };

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    window.addEventListener('mousemove', this._onMouseMove);
  }

  hostDisconnected() {
    window.removeEventListener('mousemove', this._onMouseMove);
  }
}

@customElement('my-element')
class MyElement extends LitElement {
  private mouse = new MouseController(this);

  render() {
    return html`
      <h3>The mouse is at:</h3>
      <pre>
        x: ${this.mouse.pos.x as number}
        y: ${this.mouse.pos.y as number}
      </pre>
    `;
  }
}
```

### 非同期タスク

長い時間がかかる計算やネットワークI/Oのような非同期タスクは通常、時間の経過とともにステートが変化します。
非同期タスクのステートが変化した時、それをホストコンポーネントに通知する必要があります。

コントローラはコンポーネント内でタスクの実行とステートの管理を簡単にする優れた方法です。
通常、コントローラの形式で実装されたタスクはホストコンポーネントがセットする入力とホストコンポーネントがレンダリングすることができる出力を持っています。

[@lit-labs/task](https://www.npmjs.com/package/@lit-labs/task)は汎用的な`Task`コントローラを提供します。
そのコントローラはホストコンポーネントからの入力を受け取り、タスクを実行して、タスクのステートに応じて異なるテンプレートをレンダリングします。

`Task`コントローラを使って特定のAPIに対応したカスタムコントローラを作成することができます。
下記の例では、`NamesController`内の`Task`をラップします。
`NameController`はデモのREST APIから名前のリストを取得しています。
`NameController`は入力用に`kind`プロパティを提供します。
`NameController`の`render()`メソッドはタスクのステートに応じて4つのテンプレートの内1つをレンダリングします。
タスクのロジックとホストコンポーネントの更新はホストコンポーネントから抽象化されています。

```ts
import {LitElement, html, ReactiveControllerHost} from 'lit';
import {customElement} from 'lit/decorators.js';
import {initialState, StatusRenderer, Task} from '@lit-labs/task';

type Result = Array<{name: string}>;
type Kind = typeof kinds[number];

const baseUrl = 'https://swapi.dev/api/';

const kinds = [
  '',
  'people',
  'starships',
  'species',
  'planets',
  'error'
] as const;

class NamesController {
  host: ReactiveControllerHost;
  value?: string[];
  readonly kinds = Names.kinds;
  private task!: Task;
  private _kind: Names.Kind = '';

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    this.task = new Task<[Names.Kind], Names.Result>(host,
      async ([kind]: [Names.Kind]) => {
        if (!kind?.trim()) {
          return initialState;
        }
        try {
          const response = await fetch(`${Names.baseUrl}${kind}`);
          const data = await response.json();
          return data.results as Names.Result;
        } catch {
          throw new Error(`Failed to fetch "${kind}"`);
        }
      }, () => [this.kind]
    );
  }

  set kind(value: Names.Kind) {
    this._kind = value;
    this.host.requestUpdate();
  }
  get kind() { return this._kind; }

  render(renderFunctions: StatusRenderer<Names.Result>) {
    return this.task.render(renderFunctions);
  }
}

@customElement('my-element')
export class MyElement extends LitElement {
  private names = new NamesController(this);

  render() {
    return html`
      <h3>Names List</h3>
      Kind: <select @change=${this._kindChange}>
      ${this.names.kinds.map(
        (k) => html`<option value=${k}>${k}</option>`)
      }
    </select>
    ${this.names.render({
      complete: (result: Names.Result) => html`
        <p>List of ${this.names.kind}</p>
        <ul>${result.map(i => html`<li>${i.name}</li>`)}
        </ul>
      `,
      initial: () => html`<p>Select a kind...</p>`,
      pending: () => html`<p>Loading ${this.names.kind}...</p>`,
      error: (e: any) => html`<p>${e}</p>`
    })}`;
  }

  private _kindChange(e: Event) {
    this.names.kind = (e.target as HTMLSelectElement).value as Names.Kind;
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