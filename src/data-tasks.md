{ "header": {"name": "データ管理", "order": 3}, "order": 1 }
---
# Async Tasks

## 概要

コンポーネントは非同期でのみ利用可能なデータをレンダリングする必要があることがあるでしょう。
そのようなデータはサーバやデータベースから取得されるでしょう。
より一般的に言うと非同期のAPIを使って取得もしくは計算されるでしょう。

Litのリアクティブアップデートライフサイクルは非同期でプロパティの変更をまとめて処理します。
一方、Litテンプレートは常に同期処理を行います。
テンプレートで使われるデータはレンダリング時に読み込み可能である必要があります。
Litコンポーネントで非同期データをレンダリングするには、データが使用可能になるまで待機して、読み込み可能にするためにそれを保存して、データを同期的に使う新しいレンダリングを発動します。

データをfetchしている間やデータのfetchが失敗したときに何か表示した方が良いでしょう。

`@lit/task`パッケージにこの非同期データを扱う処理を扱うための`Task`リアクティブコントローラを用意しています。

`Task`はasyncの`task`関数を受け取って、手動または`args`が変更されたときに自動的に`task`関数を実行するコントローラです。
`Task`は`task`関数の結果を保存します。そして、`task`関数が完了した際にその結果をレンダリングしてホストコンポーネントを更新します。

### 例

下記は[`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)を使ってHTTP APIを利用する`Task`の例です。
このAPIは`productId`変数が変更される毎に実行されます。
そして、コンポーネントはfetch中にローディングメッセージをレンダリングします。

```ts
import {Task} from '@lit/task';

class MyElement extends LitElement {
  @property() productId?: string;

  private _productTask = new Task(this, {
    task: async ([productId], {signal}) => {
      const response = await fetch(`http://example.com/product/${productId}`, {signal});
      if (!response.ok) { throw new Error(response.status); }
      return response.json() as Product;
    },
    args: () => [this.productId]
  });

  render() {
    return this._productTask.render({
      pending: () => html`<p>Loading product...</p>`,
      complete: (product) => html`
          <h1>${product.name}</h1>
          <p>${product.price}</p>
        `,
      error: (e) => html`<p>Error: ${e}</p>`
    });
  }
}
```

### 機能

タスク(Task)は非同期での処理を適切に遂行するために以下のような補助をしてくれます。

- ホストコンポーネントが更新される時、タスク(task)の引数の更新処理をします。
- タスクの引数が変更されている場合、タスク関数を実行します。
- タスクステータス(initial、 pending、 complete、 error)を追跡します。
- タスク関数の最終結果(値もしくはエラー)を保存します。
- タスクステータスが変更されると、ホストコンポーネントの更新を発動します。
- 競合状態(race condition)を制御します。最新のタスクのみがタスクをcompleteすることを保証します。
- 現在のタスクステータスに対応するテンプレートをレンダリングします。
- [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)を使ってタスクを中止することができます。

タスクを使うと非同期データ(Async data)を処理するための同じようなコードを複数回書かなくてすみます。
そして、競合状態や他のエッジケースを確実に制御することができます。

## 非同期データ(Async data)

Async data is data that's not available immediately, but may be available at some time in the future.
For example, instead of a value like a string or an object that's usable synchronously, a promise provides a value in the future.

Async data is usually returned from an async API, which can come in a few forms:
- Promises or async functions, like `fetch()`
- Functions that accept callbacks
- Objects that emit events, such as DOM events
- Libraries like observables and signals

The Task controller deals in promises, so no matter the shape of your async API you can adapt it to promises to use with Task.

## タスク(Task)

At the core of the Task controller is the concept of a "task" itself.

A task is an async operation which does some work to produce data and return it in a Promise. A task can be in a few different states (initial, pending, complete, and error) and can take parameters.

A task is a generic concept and could represent any async operation. They apply best when there is a request/response structure, such as a network fetch, database query, or waiting for a single event in response to some action. They're less applicable to spontaneous or streaming operations like an open-ended stream of events, a streaming database response, etc.

## Installation

```bash
npm install @lit/task
```

## Usage

`Task` is a [reactive controller](/docs/v3/composition/controllers/), so it can respond to and trigger updates to Lit's reactive update lifecycle.

You'll generally have one Task object for each logical task that your component needs to perform. Install tasks as fields on your class:

```ts
class MyElement extends LitElement {
  private _myTask = new Task(this, {/*...*/});
}
```

As a class field, the task status and value are easily available:

```ts
this._task.status;
this._task.value;
```

### The task function

The most critical part of a task declaration is the _task function_. This is the function that does the actual work.

The task function is given in the `task` option. The Task controller will automatically call the task function with arguments, which are supplied with a separate `args` callback. Arguments are checked for changes and the task function is only called if the arguments have changed.

The task function takes the task arguments as an _array_ passed as the first parameter, and an options argument as the second parameter:

```ts
new Task(this, {
  task: async ([arg1, arg2], {signal}) => {
    // do async work here
  },
  args: () => [this.field1, this.field2]
})
```

The task function's args array and the args callback should be the same length.

{% aside "positive" "no-header" %}

Write the `task` and `args` functions as arrow functions so that the `this` reference points to the host element.

{% endaside %}

### Task status

Tasks can be in one of four states:
- `INITIAL`: The task has not been run
- `PENDING`: The task is running and awaiting a new value
- `COMPLETE`: The task completed successfully
- `ERROR`: The task errored

The Task status is available at the `status` field of the Task controller, and is represented by the `TaskStatus` enum-like object, which has properties `INITIAL`, `PENDING`, `COMPLETE`, and `ERROR`.

```ts
import {TaskStatus} from '@lit/task';

// ...
  if (this.task.status === TaskStatus.ERROR) {
    // ...
  }
```

Usually a Task will proceed from `INITIAL` to `PENDING` to one of `COMPLETE` or `ERROR`, and then back to `PENDING` if the task is re-run. When a task changes status it triggers a host update so the host element can handle the new task status and render if needed.

{% aside "info" "no-header" %}

It's important to understand the status a task can be in, but it's not usually necessary to access it directly.

{% endaside %}

There are a few members on the Task controller that relate to the state of the task:
- `status`: the status of the task.
- `value`: the current value of the task, if it has completed.
- `error`: the current error of the task, if it has errored.
- `render()`: a method that chooses a callback to run based on the current status.

### Rendering Tasks

The simplest and most common API to use to render a task is `task.render()`, since it chooses the right code to run and provides it the relevant data.

`render()` takes a config object with an optional callback for each task status:
- `initial()`
- `pending()`
- `complete(value)`
- `error(err)`

You can use `task.render()` inside a Lit `render()` method to render templates based on the task status:

```ts
  render() {
    return html`
      ${this._myTask.render({
        initial: () => html`<p>Waiting to start task</p>`,
        pending: () => html`<p>Running task...</p>`,
        complete: (value) => html`<p>The task completed with: ${value}</p>`,
        error: (error) => html`<p>Oops, something went wrong: ${error}</p>`,
      })}
    `;
  }
```

### Running tasks

By default, Tasks will run any time the arguments change. This is controlled by the `autoRun` option, which defaults to `true`.

#### Auto-run

In _auto-run_ mode, the task will call the `args` function when the host has updated, compare the args to the previous args, and invoke the task function if they have changed. A task without `args` defined is in manual mode.

#### Manual mode

If `autoRun` is set to false, the task will be in _manual_ mode. In manual mode you can run the task by calling the `.run()` method, possibly from an event handler:

{% switchable-sample %}

```ts
class MyElement extends LitElement {

  private _getDataTask = new Task(
    this,
    {
      task: async () => {
        const response = await fetch(`example.com/data/`);
        return response.json();
      },
      args: () => []
    }
  );

  render() {
    return html`
      <button @click=${this._onClick}>Get Data</button>
    `;
  }

  private _onClick() {
    this._getDataTask.run();
  }
}
```

```js
class MyElement extends LitElement {

  _getDataTask = new Task(
    this,
    {
      task: async () => {
        const response = await fetch(`example.com/data/`);
        return response.json();
      },
      args: () => []
    }
  );

  render() {
    return html`
      <button @click=${this._onClick}>Get Data</button>
    `;
  }

  _onClick() {
    this._getDataTask.run();
  }
}
```

{% endswitchable-sample %}

In manual mode you can provide new arguments directly to `run()`:

```ts
this._task.run('arg1', 'arg2');
```

If arguments are not provided to `run()`, they are gathered from the `args` callback.

### Aborting tasks

A task function can be called while previous task runs are still pending. In these cases the result of the pending task runs will be ignored, and you should try to cancel any outstanding work or network I/O in order to save resources.

You can do with with the [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) that is passed in the `signal` property of the second argument to the task function. When a pending task run is superseded by a new run, the `AbortSignal` that was passed to the pending run is aborted to signal the task run to cancel any pending work.

`AbortSignal` doesn't cancel any work automatically - it is just a signal. To cancel some work you must either do it yourself by checking the signal, or forward the signal to another API that accepts `AbortSignal`s like [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/fetch) or [`addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener).

The easiest way to use the `AbortSignal` is to forward it to an API that accepts it, like `fetch()`.

{% switchable-sample %}

```ts
  private _task = new Task(this, {
    task: async (args, {signal}) => {
      const response = await fetch(someUrl, {signal});
      // ...
    },
  });
```

```js
  _task = new Task(this, {
    task: async (args, {signal}) => {
      const response = await fetch(someUrl, {signal});
      // ...
    },
  });
```

{% endswitchable-sample %}

Forwarding the signal to `fetch()` will cause the browser to cancel the network request if the signal is aborted.

You can also check if a signal has been aborted in your task function. You should check the signal after returning to a task function from an async call. `throwIfAborted()` is a convenient way to do this:

{% switchable-sample %}

```ts
  private _task = new Task(this, {
    task: async ([arg1], {signal}) => {
      const firstResult = await doSomeWork(arg1);
      signal.throwIfAborted();
      const secondResult = await doMoreWork(firstResult);
      signal.throwIfAborted();
      return secondResult;
    },
  });
```

```js
  _task = new Task(this, {
    task: async ([arg1], {signal}) => {
      const firstResult = await doSomeWork(arg1);
      signal.throwIfAborted();
      const secondResult = await doMoreWork(firstResult);
      signal.throwIfAborted();
      return secondResult;
    },
  });
```

{% endswitchable-sample %}

### Task chaining

Sometimes you want to run one task when another task completes.
This can be useful if the tasks have different arguments so that the chained task may run without the first task running again.
In this case it'll use the first task like a cache. To do this you can use the value of a task as an argument to another task:

{% switchable-sample %}

```ts
class MyElement extends LitElement {
  private _getDataTask = new Task(this, {
    task: ([dataId]) => getData(dataId),
    args: () => [this.dataId],
  });

  private _processDataTask = new Task(this, {
    task: ([data, param]) => processData(data, param),
    args: () => [this._getDataTask.value, this.param],
  });
}
```

```js
class MyElement extends LitElement {
  _getDataTask = new Task(this, {
    task: ([dataId]) => getData(dataId),
    args: () => [this.dataId],
  });

  _processDataTask = new Task(this, {
    task: ([data, param]) => processData(data, param),
    args: () => [this._getDataTask.value, this.param],
  });
}
```

{% endswitchable-sample %}

You can also often use one task function and await intermediate results:

{% switchable-sample %}

```ts
class MyElement extends LitElement {
  private _getDataTask = new Task(this, {
    task: ([dataId, param]) => {
      const data = await getData(dataId);
      return processData(data, param);
    },
    args: () => [this.dataId, this.param],
  });
}
```

```js
class MyElement extends LitElement {
  _getDataTask = new Task(this, {
    task: ([dataId, param]) => {
      const data = await getData(dataId);
      return processData(data, param);
    },
    args: () => [this.dataId, this.param],
  });
}
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