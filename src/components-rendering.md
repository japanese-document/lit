{ "header": {"name": "コンポーネント", "order": 0}, "order": 1 }
---
# レンダリング

レンダリングはコンポーネントにテンプレートを追加することで定義します。
テンプレートにはエクスプレッション(expressions)を含めることができます。
それは動的なコンテンツのプレースフォルダです。

下記のように、Litコンポーネントに`render()`メソッドを追加することによってテンプレートを追加します。

```
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-element')
class MyElement extends LitElement {

  render(){
    return html`<p>Hello from my template.</p>`;
  }
}
```

上記のようにLitの`html`タグ関数を使って、JavaScriptの[tagged template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates)にHTMLを記述します。

LitテンプレートにJavaScriptの式を含めることができます。
エクスプレッションを使って要素にテキストコンテンツ、属性、プロパティ、イベントリスナをセットすることができます。
`render()`メソッドにJavaScriptの処理を記述することもできます。
例えば、エクスプレッションで使うローカル変数を作成することができます。

## レンダリング可能な値

通常、Litコンポーネントの`render()`メソッドは`TemplateResult`オブジェクト(`html`タグ関数の戻り値と同じ型)を1つ返します。
それ以外にも、`render()`メソッドはLitがレンダリング可能な下記の値を返すことができます。

*   string、number、boolean等のプリミティブ値
*   `html`関数で生成される`TemplateResult`オブジェクト
*   DOM Nodes
*   センチネル値([`nothing`](https://japanese-document.github.io/lit/api-templates.html#nothing__symbol)と[`noChange`](https://lit.dev/docs/templates/custom-directives/#signaling-no-change))
*   サポートされている型の配列もしくはiterables

これは[child expressions](https://japanese-document.github.io/lit/templates-expressions.html#Child_expressions)にセットできる値とほぼ同じです。
1点だけある違いはchild expressionsは`SVGTemplateResult`をレンダリングすることができます。
これは[`svg`](https://japanese-document.github.io/lit/api-templates.html#svg(strings__TemplateStringsArray,_values__Array)__TemplateResult)で生成します。
`SVGTemplateResult`は`<svg>`要素の子要素としてのみレンダリングすることができます。

## render()メソッドの注意点

Litのレンダリング機構を活用するためには、
`render()`メソッドは以下のガイドラインに従う必要があります。

* `render()`メソッドでコンポーネントのステート(state)を変更しない。
* `render()`メソッドで副作用(side effects)を発生させない。
* 入力にはコンポーネントのプロパティのみを使う。
* 同じプロパティの場合、同じ結果を返す。

このガイドラインに従うとテンプレートは参照等価性を保つことができます。
そして、コードを理解しやすくなります。

ほどんどの場合、`render()`以外でDOMの更新をすることは避けるべきです。
代わりにコンポーネントのステートをプロパティに保存して、テンプレートでそれらが反映されるようにします。

例えば、コンポーネントがイベントを受け取ってUIにそれを反映したい場合、イベントリスナで直接DOMを操作するのではなくリアクティブプロパティに値をセットしてそれを`render()`で使います。

詳しくは[リアクティブプロパティ](https://japanese-document.github.io/lit/components-properties.html)を見てください。

## テンプレートを組み合わせる

テンプレートを組み合わせてテンプレートを作成できます。
以下の例は`<my-page>`コンポーネントのテンプレートはヘッダー、フッター、メインコンテントのテンプレートを組み合わせて作られています。

```
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';


@customElement('my-page')
class MyPage extends LitElement {

  @property({attribute: false})
  article = {
    title: 'My Nifty Article',
    text: 'Some witty text.',
  };

  headerTemplate() {
    return html`<header>${this.article.title}</header>`;
  }

  articleTemplate() {
    return html`<article>${this.article.text}</article>`;
  }

  footerTemplate() {
    return html`<footer>Your footer here.</footer>`;
  }

  render() {
    return html`
      ${this.headerTemplate()}
      ${this.articleTemplate()}
      ${this.footerTemplate()}
    `;
  }
}
```


上記の例では、各テンプレートはインスタンスメソッドで定義されています。
このコンポーネントのサブクラスは1つ以上のテンプレートをオーバーライドすることができます。

下記のように要素をテンプレートに配置してテンプレートを作成することもできます。

```
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('my-header')
class MyHeader extends LitElement {
  render() {
    return html`
      <header>header</header>
    `;
  }
}

@customElement('my-article')
class MyArticle extends LitElement {
  render() {
    return html`
      <article>article</article>
    `;
  }
}

@customElement('my-footer')
class MyFooter extends LitElement {
  render() {
    return html`
      <footer>footer</footer>
    `;
  }
}

@customElement('my-page')
class MyPage extends LitElement {
  render() {
    return html`
      <my-header></my-header>
      <my-article></my-article>
      <my-footer></my-footer>
    `;
  }
}
```

## テンプレートがレンダリングされるタイミング

初回のレンダリングの後、
コンポーネントのリアクティブプロパティが変更されると更新サイクルが始動して、
コンポーネントが再レンダリングされます。

Litはパフォーマンスと効率を最大化するために更新を1回にまとめます。
1度に複数のプロパティをセットしても、更新は1回のみ発動します。
更新は[microtask](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)で非同期的に実行されます。

更新は変更されている部分のみが再レンダリングされます。
Litテンプレートは文字列に値を埋め込んでいるだけに見えますが、
Litはそれを解析して静的なHTMLを1回生成します。
それ以降は効率的に更新するためにエクスプレッション内の変更された値のみを更新します。

更新サイクルの詳細は[What happens when properties change](https://lit.dev/docs/components/properties/#when-properties-change)を見てください。

## DOMのカプセル化

LitはコンポーネントがレンダリングしたDOMをShadow DOMを使ってカプセル化します。
Shadow DOMはメインのdocumentツリーとは別の独立したDOMツリーを持ちます。
Shadow DOMはweb componentsのコア機能の1つです。Shadow DOMは相互運用性(interoperability)やスタイルのカプセル化等の利益をもたらします。

Shadow DOMの詳しい内容は[Shadow DOM v1: Self-Contained Web Components
](https://developers.google.com/web/fundamentals/web-components/shadowdom)にあります。

コンポーネントでのShadow DOMの動作ついての詳細は[Working with shadow DOM](https://lit.dev/docs/components/shadow-dom/)を見てください。

## 関連情報

* [Shadow DOM](https://lit.dev/docs/components/shadow-dom/)
* [Templates overview](https://lit.dev/docs/templates/overview/)
* [Template expressions](https://japanese-document.github.io/lit/templates-expressions.html)

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