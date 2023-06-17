{ "header": {"name": "テンプレート", "order": 1}, "order": 1 }
---
# ビルトインディレクティブ

ディレクティブを使うとエクスプレッションのレンダリング方法を変更することによってLitを拡張することができます。
Litは下記のような多様な用途に対応したビルドインディレクティブを用意しています。

<table class="directory">
  <tr><th>ディレクティブ</th><th>サマリー</th></tr>
  <tr class="subheading"><td colspan="2">

  スタイル

  </td></tr>
  <tr>
  <td>

  [`classMap`](#classMap)

  </td>
  <td>
  渡されたobjectに応じて要素にclass属性を割り当てます。
  </td>
  </tr>

  <tr>
  <td>

  [`styleMap`](#styleMap)

  </td>
  <td>
  渡されたobjectに応じて要素にstyle属性を割り当てます。
  </tr>

  <tr class="subheading"><td colspan="2">

  繰り返しと条件

  </td></tr>

  <tr>
  <td>

  [`when`](#when)

  </td>
  <td>条件に応じて渡された2つのテンプレートの内1つをレンダリングします。</td>
  </tr>

  <tr>
  <td>

  [`choose`](#choose)

  </td>
  <td>オブジェクトのキーの値に応じて指定した多数のテンプレートの内1つをレンダリングします。</td>
  </tr>

  <tr>
  <td>

  [`map`](#map)

  </td>
  <td>iterableの各値を指定した関数で変換します。</td>
  </tr>

  <tr>
  <td>

  [`repeat`](#repeat)

  </td>
  <td>iterableの各値をDOMにレンダリングします。オプションでそれらにkeyを付与する処理を追加することができます。</td>
  </tr>

  <tr>
  <td>

  [`join`](#join)

  </td>
  <td>iterableの各値を指定した値で連結します。</td>
  </tr>

  <tr>
  <td>

  [`range`](#range)

  </td>
  <td>連続した数値を値に持つiterableを生成します。これは繰り返しの回数を指定する際に便利です。</td>
  </tr>

  <tr>
  <td>

  [`ifDefined`](#ifDefined)

  </td>
  <td>値が定義されている場合は属性をセットします。undefinedの場合は属性を削除します。</td>
  </tr>

  <tr class="subheading"><td colspan="2">

  キャッシュと変更の検出

  </td></tr>

  <tr>
  <td>

  [`cache`](#cache)

  </td>
  <td>テンプレートを変更した時、DOMを破棄するのではなくレンダリング済みのDOMをキャッシュします。</td>
  </tr>

  <tr>
  <td>

  [`keyed`](#keyed)

  </td>
  <td>レンダリング可能な値とユニークなキーを関連付けます。そして、キーが変化すると強制的に関連付けられた値が強制的に再レンダリングされます。</td>
  </tr>

  <tr>
  <td>

  [`guard`](#guard)

  </td>
  <td>指定した変更を検知するための値の内1つが変更された場合のみテンプレートを再評価します。</td>
  </tr>

  <tr>
  <td>

  [`live`](#live)

  </td>
  <td>最後にレンダリングされた時の値が現行のDOMの属性もしくはプロパティと異なっていた場合、それに値をセットします。</td>
  </tr>

  <tr class="subheading"><td colspan="2">

  レンダリングされたDOMの参照

  </td></tr>

  <tr>
  <td>

  [`ref`](#ref)

  </td>
  <td>テンプレートでレンダリングされた要素の参照を取得します。</td>
  </tr>

  <tr class="subheading"><td colspan="2">

  特殊な値のレンダリング

  </td></tr>

  <tr>
  <td>

  [`templateContent`](#templateContent)

  </td>
  <td>

  `<template>`要素のコンテンツをレンダリングします。

  </td>
  </tr>

  <tr>
  <td>

  [`unsafeHTML`](#unsafeHTML)

  </td>
  <td>文字列をテキストではなくHTMLとしてレンダリングします。</td>
  </tr>

  <tr>
  <td>

  [`unsafeSVG`](#unsafeSVG)

  </td>
  <td>文字列をテキストではなくSVGとしてレンダリングします。</td>
  </tr>

  <tr class="subheading"><td colspan="2">

  非同期レンダリング

  </td></tr>

  <tr>
  <td>

  [`until`](#until)

  </td>
  <td>1つ以上のPromiseが解決するまでプレイスフォルダのコンテンツをレンダリングします。</td>
  </tr>

  <tr>
  <td>

  [`asyncAppend`](#asyncAppend)

  </td>
  <td>

  `AsyncIterable`の各値を解決される毎にDOMに追記していきます。

  </td>
  </tr>

  <tr>
  <td>

  [`asyncReplace`](#asyncReplace)

  </td>
  <td>

  `AsyncIterable`の各値を解決される毎にDOMを置き換えます。

  </td>
  </tr>
</table>

独自のディレクティブを作成することができます。
詳しくは[カスタムディレクティブ](https://japanese-document.github.io/lit/templates-custom-directives.html)を見てください。

## スタイル

### classMap

渡されたobjectに応じて要素のclass属性にclass名のリストを割り当てます。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {classMap} from 'lit/directives/class-map.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
classMap(classInfo: {[name: string]: string | boolean | number})
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

`class`属性に対応する[エクスプレッション](https://japanese-document.github.io/lit/templates-expressions.html)

</td>
</tr>
</tbody>
</table>

`classMap`ディレクティブは渡されたオブジェクトに応じて`element.classList`を使って効率的にclass属性に値を追加および削除します。
オブジェクトの各キーはclass名です。その値がtrueと評価できる場合、要素のclass属性にそのclass名を加えます。
その後のレンダリングでは、1つ前のレンダリングでclass属性にセットされていたclass名のうち値がfalseと評価できるものやオブジェクトにキーが存在しないものはclass属性から削除されます。

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property({type: Boolean})
  enabled = false;

  render() {
    const classes = { enabled: this.enabled, hidden: false };
    return html`<div class=${classMap(classes)}>Classy text</div>`;
  }
}
```

`classMap`は下記のようにclass属性の静的な値と組み合わせることができます。

```ts
html`<div class="my-widget ${classMap(dynamicClasses)}">Static and dynamic</div>`;
```

`classMap`を使用した例は[こちら](https://lit.dev/playground/#sample=examples/directive-class-map)です。

### styleMap

渡されたobjectに応じて要素にstyleプロパティのリストを割り当てます。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {styleMap} from 'lit/directives/style-map.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
styleMap(styleInfo: {[name: string]: string | undefined | null})
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

`style`属性に対応する[エクスプレッション](https://japanese-document.github.io/lit/templates-expressions.html)

</td>
</tr>
</tbody>
</table>

`styleMap`ディレクティブは渡されたオブジェクトに応じて`element.style` APIを使って効率的に要素のstyle属性にスタイルを追加したり削除したりします。
渡されたオブジェクトの各キーはスタイルのプロパティ名になります。その値はスタイルのプロパティの値になります。
その後のレンダリングでは、値がセットされていなかったり`null`の場合は1つ前のレンダリングでセットされていたスタイルプロパティは削除されます。

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property({type: Boolean})
  enabled = false;

  render() {
    const styles = { backgroundColor: this.enabled ? 'blue' : 'gray', color: 'white' };
    return html`<p style=${styleMap(styles)}>Hello style!</p>`;
  }
}
```

下記のようにCSSプロパティ名に`-`が含まれている場合、camel-caseにするか、プロパティ名を`'`内に置きます。
例えば、`font-family`は`fontFamily`もしくは`'font-family'`にすることができます。

```js
{ fontFamily: 'roboto' }
{ 'font-family': 'roboto' }
```

CSSカスタムプロパティを参照する場合、下記のようにプロパティ名全体を`'`内に置きます。

```js
{ '--custom-color': 'steelblue' }
```

`styleMap`はstyle属性内の唯一のエクスプレッションでなければなりませんが、下記のように静的な値と組み合わせることができます。

```js
html`<p style="color: white; ${styleMap(moreStyles)}">More styles!</p>`;
```

詳しくは[playground](https://lit.dev/playground/#sample=examples/directive-style-map)を見てください。

## 繰り返しと条件

### when

条件に応じて渡された2つのテンプレートの内1つをレンダリングします。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {when} from 'lit/directives/when.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
when<T, F>(
  condition: boolean,
  trueCase: () => T,
  falseCase?: () => F
)
```
</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

どこでも

</td>
</tr>
</tbody>
</table>

`condition`がtrueの場合、`trueCase()`を実行した結果を返します。そうでない場合、`falseCase`が渡されているなら`falseCase()`を実行した結果を返します。
これは三項演算子のラッパーです。これを使うとelseを使わないでインラインで書くことができるので少しだけキレイに書くことができます。

```ts
class MyElement extends LitElement {
  render() {
    return html`
      ${when(this.user, () => html`User: ${this.user.username}`, () => html`Sign In...`)}
    `;
  }
}
```

### choose

渡された`value`にマッチする関数を実行してテンプレートを返します。
`case`にはキーとテンプレートを返す関数の配列を渡します。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {choose} from 'lit/directives/choose.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
choose<T, V>(
  value: T,
  cases: Array<[T, () => V]>,
  defaultCase?: () => V
)
```
</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

どこでも

</td>
</tr>
</tbody>
</table>


`cases`の構造は`[caseValue, func]`です。
`value`は`caseValue`と`===`で比較されます。
最初にマッチしたものを採用します。
`caseValue`には任意の型の値を指定することができます。

```ts
class MyElement extends LitElement {
  render() {
    return html`
      ${choose(this.section, [
        ['home', () => html`<h1>Home</h1>`],
        ['about', () => html`<h1>About</h1>`]
      ],
      () => html`<h1>Error</h1>`)}
    `;
  }
}
```

### map

`items`の各値に対して`f(value)`を実行した結果を格納しているiterableを返します。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {map} from 'lit/directives/map.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
map<T>(
  items: Iterable<T> | undefined,
  f: (value: T, index: number) => unknown
)
```
</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

どこでも

</td>
</tr>
</tbody>
</table>

`map()`は[for/of loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)の簡単なラッパです。
これはエクスプレッション内でのiterableに対する処理を少しだけ簡単にします。
`map()`で生成されたすべてのDOMは更新されます。(差分やDOMの移動は発生しません。)
それが必要な場合は[repeat](#repeat)を見てください。
`map()`は`repeat()`より低コストで高速です。だから、差分やDOMの安定性が必要ない場合は`map()`を使うことが好ましいです。


```ts
class MyElement extends LitElement {
  render() {
    return html`
      <ul>
        ${map(items, (i) => html`<li>${i}</li>`)}
      </ul>
    `;
  }
}
```

### repeat

iterableの値をDOMにレンダリングします。その際にDOMの安定性を付与するためにキーをDOMに付与します。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {repeat} from 'lit/directives/repeat.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
repeat(items: Iterable<T>, keyfn: KeyFn<T>, template: ItemTemplate<T>)
repeat(items: Iterable<T>, template: ItemTemplate<T>)
type KeyFn<T> = (item: T, index: number) => unknown;
type ItemTemplate<T> = (item: T, index: number) => unknown;
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

[Child expression](https://japanese-document.github.io/lit/templates-expressions.html#Child_expressions)

</td>
</tr>
</tbody>
</table>

`repeat`はiterableからレンダリング対象の値(通常は`TemplateResults`の配列)を生成します。
そして、iterableが変更された時、それらを効率的に更新します。
`keyFn`が渡された場合、キーがDOMに付与されます。
キーとDOMの関係はDOMが移動する更新で維持されます。
これは不要な要素の挿入と削除を最小にすることができるので、一般的に`repeat`を使うことは最も効率的な方法です。

`keyFn`が必要ない場合、[`map()`](#map)を使うことを検討した方が良いかもしれません。

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property()
  items: Array<{id: number, name: string}> = [];

  render() {
    return html`
      <ul>
        ${repeat(this.items, (item) => item.id, (item, index) => html`
          <li>${index}: ${item.name}</li>`)}
      </ul>
    `;
  }
}
```

`keyFn`が渡されなかった場合、`repeat`は単純な`map`と似た動きをします。
その場合、DOMは違う値と関連付けられる可能性があります。

詳しくは[mapとrepeatの使い分け](https://lit.dev/docs/templates/lists/#when-to-use-map-or-repeat)を見てください。

### join

`items`の各値の間に`joiner`の値を挿入したiterableを返します。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {join} from 'lit/directives/join.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
join<I, J>(
  items: Iterable<I> | undefined,
  joiner: J
): Iterable<I | J>;

join<I, J>(
  items: Iterable<I> | undefined,
  joiner: (index: number) => J
): Iterable<I | J>;
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

どこでも

</td>
</tr>
</tbody>
</table>

```ts

class MyElement extends LitElement {

  render() {
    return html`
      ${join(
        map(menuItems, (i) => html`<a href=${i.href}>${i.label}</a>`),
        html`<span class="separator">|</span>`
      )}
    `;
  }
}
```

### range

`start`から`end`まで`step`分だけ増加した一連の整数のiterableを返します。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {range} from 'lit/directives/range.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
range(end: number): Iterable<number>;

range(
  start: number,
  end: number,
  step?: number
): Iterable<number>;

```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

どこでも

</td>
</tr>
</tbody>
</table>

```ts

class MyElement extends LitElement {

  render() {
    return html`
      ${map(range(8), (i) => html`${i + 1}`)}
    `;
  }
}
```

### ifDefined

渡された値が定義されているなら属性をセットします。未定義なら属性を削除します。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {ifDefined} from 'lit/directives/if-defined.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
ifDefined(value: unknown)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

[Attribute expression](https://japanese-document.github.io/lit/templates-expressions.html#Attribute_expressions)

</td>
</tr>
</tbody>
</table>

このディレクティブは属性部分に配置された場合、値が定義されていると属性をセットします。値が未定義(`undefined`もしくは`null`)だと属性を削除します。
他の部分に配置された場合、何もしません。

1つの属性に1つ以上のエクスプレッションが存在する場合、
1つでも`ifDefined`に`undefined`/`null`渡されたものがある場合、その属性は削除されます。
これはurlの属性をセットする際に特に便利です。
urlに必要な部分が定義されていない場合、404を防ぐために属性をセットしません。

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property()
  filename: string | undefined = undefined;

  @property()
  size: string | undefined = undefined;

  render() {
    // sizeもしくはfilenameが未定義の場合、src属性はレンダリングさません。
    return html`<img src="/images/${ifDefined(this.size)}/${ifDefined(this.filename)}">`;
  }
}
```

## キャッシュと変更の検出

### cache

渡されたテンプレートが変更した時、レンダリングされたDOMを廃棄するのではなくキャッシュします。
大きなテンプレートを頻繁に切り替える場合、このディレクティブを使うことでパフォーマンスが改善されます。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {cache} from 'lit/directives/cache.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
cache(value: TemplateResult|unknown)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

[Child expression](https://japanese-document.github.io/lit/templates-expressions.html#Child_expressions)

</td>
</tr>
</tbody>
</table>

`cache`に渡された`TemplateResult`が変更されると、
渡されたテンプレートがレンダリングされたDOMはそれらが使われない時にキャッシュされます。
テンプレートが変更されると、このディレクティブは新しい値に切り替える前に現行のDOM Nodeをキャッシュします。
このディレクティブは過去にレンダリングされた値に戻す時、新しいDOM Nodeを生成するのではなくキャッシュから復元します。

```ts
const detailView = (data) => html`<div>...</div>`;
const summaryView = (data) => html`<div>...</div>`;

@customElement('my-element')
class MyElement extends LitElement {

  @property()
  data = {showDetails: true, /*...*/ };

  render() {
    return html`${cache(this.data.showDetails
      ? detailView(this.data)
      : summaryView(this.data)
    )}`;
  }
}
```

Litのデフォルトの動作は、テンプレートを再レンダリングすると、変更された部分のみが更新されます。
必要なDOMのみが作成または削除されます。
しかし、レンダリングされるテンプレートが別のテンプレートに切り替わると、
Litは現行のDOM treeを削除して新しいDOMツリーをレンダリングします。

`cache`ディレクティブは生成されたDOMをキャッシュします。
上記の例は`summaryView`および`detailView`の両方に対するDOMをキャッシュします。
When you switch from one view to another, Lit swaps in the cached version of the new view and updates it with the latest data.
This can improve rendering performance when these views are frequently switched.

### keyed

ユニークなキーとレンダリング可能な値を関連付けます。
キーが変更されると、
テンプレートの内容が同じでも、
次の値がレンダリングされる前に現行のDOMは削除されて破棄されます。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {keyed} from 'lit/directives/keyed.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
keyed(key: unknown, value: unknown)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

すべてのエクスプレッション

</td>
</tr>
</tbody>
</table>

`keyed`はステートを持つ要素をレンダリングしていて重要なデータが変更されて要素のすべてのステートを確実にクリアする必要がある時に役立ちます。
これは基本的にLitのデフォルトのDOMを再利用する方針とは異なります。

`keyed`は新しい要素にenterやexitのアニメーションを適用にするようなCSSアニメーションを制作する際にも役立ちます。

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property()
  userId: string = '';

  render() {
    return html`
      <div>
        ${keyed(this.userId, html`<user-card .userId=${this.userId}></user-card>`)}
      </div>`;
  }
}
```

### guard

`dependencies`が1つでも変更された場合のみテンプレートが再評価されます。
これによってレンダリングの不要な作業を削減することでパフォーマンスが改善されます。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {guard} from 'lit/directives/guard.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
guard(dependencies: unknown[], valueFn: () => unknown)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

すべてのエクスプレッション

</td>
</tr>
</tbody>
</table>

`valueFn`の戻り値をレンダリングします。
そして`dependencies`が1つでも`===`で比較して変更された時だけ`valueFn`を再評価します。

引数:

- `dependencies`は変更を検知する対象を格納している配列です。
- `valueFn`はレンダリング可能な値を返す関数です。

`guard`はデータが変更されるまで高コストの処理を行わないイミュータブルデータパターンに利用することができます。

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property()
  value: string = '';

  render() {
    return html`
      <div>
        ${guard([this.value], () => calculateSHA(this.value))}
      </div>`;
  }
}
```

上記のケースでは、`value`プロパティが変更された時のみ高コストの`calculateSHA`関数を実行します。

### live

属性やプロパティの値が(最後のレンダリング時の値ではなく)現行のDOMの値と異なる場合、属性やプロパティに値をセットします。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {live} from 'lit/directives/live.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
live(value: unknown)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

[Attribute expression](https://japanese-document.github.io/lit/templates-expressions.html#Attribute_expressions)もしくは[Property expression](https://japanese-document.github.io/lit/templates-expressions.html#Property_expressions)

</td>
</tr>
</tbody>
</table>

属性やプロパティの値を更新するかの判断は、
Litのデフォルトの動作ではエクスプレッションに最後にセットされた値と比較します。
`live`を使うと現行のDOMの属性やプロパティの値と比較します。
詳しくは[こちら](https://lit.dev/playground/#sample=examples/directive-live)を見てください。

これはDOMの値がLitの外部から変更される可能性がある場合に役立ちます。
例えば、
`<input>`要素の`value`プロパティの値をセットするエクスプレッションが配置され、
この`value`プロパティはユーザの入力によって編集可能であり、
custom elementの側でもそのプロパティもしくは属性を変更する場合です。

DOM上の値が変化したがエクスプレッションでセットされた値が変化していない場合、
LitはそのDOM上の値が変化したことを検知することができません。DOM上の値はエクスプレッションでセットされている値で上書きされません。
この挙動を変えたい場合(常にエクスプレッションにセットされた値で上書きしたい場合)は`live()`ディレクティブを使います。

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @property()
  data = {value: 'test'};

  render() {
    return html`<input .value=${live(this.data.value)}>`;
  }
}
```

`live()`は現行のDOMの値と渡された値を`===`で比較します。そして、それらが等しい場合は何もしません。
つまり、エクスプレッションが型を変換するような場合は`live()`を使うべきではありません。
[Attribute expression](https://japanese-document.github.io/lit/templates-expressions.html#Attribute_expressions)に対する`live()`には文字列のみを渡してください。そうしないとエクスプレッションは常にレンダリング毎に更新を発生させます。

## 特殊な値のレンダリング

### templateContent

`<template>`要素のコンテンツをレンダリングします。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {templateContent} from 'lit/directives/template-content.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
templateContent(templateElement: HTMLTemplateElement)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

[Child expression](https://japanese-document.github.io/lit/templates-expressions.html#Child_expressions)

</td>
</tr>
</tbody>
</table>

LitテンプレートはJavaScript内でエンコードされます。
だから、それにJavaScriptのエクスプレッションを埋め込むことでそれを動的にすることができます。
Liテンプレートに静的な`<template>`要素を組み込みたい場合、`templateContent`ディレクティブを使います。
`templateContent`ディレクティブはテンプレートのコンテンツを複製します。そして、それをLitテンプレートに組み込みます。
template要素の参照が1つ前のレンダリング時と変わらない限り、その後のレンダリングでは何もしません。

template要素のコンテンツは見ず知らずの人が作成した信頼できない文字列が含まれないように注意してください。
信頼できない文字列の例としてクエリパラメータの値やユーザが入力した値があります。
信頼できないtemplate要素のコンテンツをこのディレクティブでレンダリングすることは[クロスサイトスクリプティング(XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting)の原因になります。

```ts
const templateEl = document.querySelector('template#myContent') as HTMLTemplateElement;

@customElement('my-element')
class MyElement extends LitElement {

  render() {
    return  html`
      Here's some content from a template element:
      ${templateContent(templateEl)}`;
  }
}
```

詳しくは[こちら](https://lit.dev/playground/#sample=examples/directive-template-content)を見てください。

### unsafeHTML

文字列をテキストではなくHTMLとしてレンダリングします。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
unsafeHTML(value: string | typeof nothing | typeof noChange)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

[Child expression](https://japanese-document.github.io/lit/templates-expressions.html#Child_expressions)

</td>
</tr>
</tbody>
</table>

Litのテンプレートシンタックスの重要な機能はテンプレートリテラル内の文字列のみがHTMLとしてパースされることです。
テンプレートリテラルは信頼することができるスクリプトファイル内でのみ記述することができるので、
これは信頼することができないHTMLが混入することから生じるXSSに対する根本的な対策です。
しかし、スクリプトファイル以外から得たHTMLをLitテンプレート内でレンダリングする必要がある場合もあるかもしれません。
例えば、データベースからfetchした信頼できるHTMLをレンダリングする場合です。
`unsafeHTML`ディレクティブはそのような文字列をHTMLとしてパースします。そして、それをLitテンプレートでレンダリングします。

`unsafeHTML`渡される文字列は内容を把握されていて信頼できない物が含まれていないように注意してください。
信頼できない文字列の例としてクエリパラメータの値やユーザが入力した値があります。
信頼できないコンテンツをこのディレクティブでレンダリングすることは[クロスサイトスクリプティング(XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting)の原因になります。

```ts
const markup = '<h3>Some HTML to render.</h3>';

@customElement('my-element')
class MyElement extends LitElement {

  render() {
    return html`
      Look out, potentially unsafe HTML ahead:
      ${unsafeHTML(markup)}
    `;
  }
}
```

詳しくは[こちら](https://lit.dev/playground/#sample=examples/directive-unsafe-html)を見てください。

### unsafeSVG

文字列をテキストではなくSVGとしてレンダリングします。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {unsafeSVG} from 'lit/directives/unsafe-svg.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
unsafeSVG(value: string | typeof nothing | typeof noChange)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

[Child expression](https://japanese-document.github.io/lit/templates-expressions.html#Child_expressions)

</td>
</tr>
</tbody>
</table>

[`unsafeHTML`](#unsafeHTML)に似ています。
しかし、スクリプトファイル以外から得たSVGをLitテンプレート内でレンダリングする必要がある場合もあるかもしれません。
例えば、データベースからfetchした信頼できるSVGをレンダリングする場合です。
`unsafeSVG`ディレクティブはそのような文字列をSVGとしてパースします。そして、それをLitテンプレートでレンダリングします。

`unsafeSVG`渡される文字列は内容を把握されていて信頼できない物が含まれていないように注意してください。
信頼できない文字列の例としてクエリパラメータの値やユーザが入力した値があります。
信頼できないコンテンツをこのディレクティブでレンダリングすることは[クロスサイトスクリプティング(XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting)の原因になります。

```ts
const svg = '<circle cx="50" cy="50" r="40" fill="red" />';

@customElement('my-element')
class MyElement extends LitElement {

  render() {
    return html`
      Look out, potentially unsafe SVG ahead:
      <svg width="40" height="40" viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg" version="1.1">
        ${unsafeSVG(svg)}
      </svg> `;
  }
}
```

詳しくは[こちら](https://lit.dev/playground/#sample=examples/directive-unsafe-svg)を見てください。


## レンダリングされたDOMの参照

### ref

DOMにレンダリングされた１つの要素への参照を取得します。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {ref} from 'lit/directives/ref.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
ref(refOrCallback: RefOrCallback)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

[Element expression](https://japanese-document.github.io/lit/templates-expressions.html#Element_expressions)

</td>
</tr>
</tbody>
</table>

LitでのほとんどのDOMの操作はテンプレートを使って宣言的に行うことができます。
しかし、テンプレート内のレンダリングされた要素の参照を取得して、それを命令的に操作したい場合があるかもしれません。
これの一般的な例は、フォーム内のコントロールにフォーカスを当てることやコンテナ要素上で命令的なDOM操作をするライブラリを実行することです。

テンプレートの要素上に配置すると、
`ref`ディレクティブはレンダリング直後にその要素の参照を取得します。
要素の参照をする方法は2つあります。
それは`Ref`オブジェクトを渡す方法とコールバック関数を渡す方法です。

`Ref`オブジェクトは要素の参照のコンテナの役割を果たします。
`Ref`オブジェクトは`ref`モジュールの[createRef](https://lit.dev/docs/api/directives/#createRef)関数を使って生成します。
`updated`のようなレンダリング後のライフサイクルで、
`Ref`オブジェクトの`value`プロパティに要素がセットされていて使用することができます。

```ts
@customElement('my-element')
class MyElement extends LitElement {

  inputRef: Ref<HTMLInputElement> = createRef();

  render() {
    // refディレクティブにRefオブジェクトを渡します。Refオブジェクトのvalueプロパティに要素が格納されます。
    return html`<input ${ref(this.inputRef)}>`;
  }

  firstUpdated() {
    const input = this.inputRef.value!;
    input.focus();
  }
}
```

コールバック関数を`ref`ディレクティブに渡すことができます。
参照される要素が変更される度、コールバック関数が実行されます。
コールバックが別の要素上でレンダリングされたり、その後のレンダリングで削除された場合、
その後の最初の1回は`undefined`が渡されて実行されます。
その後に新しい要素に付与した場合はその要素を渡したコールバック関数が実行されます。
`LitElement`では、refディレクティブに渡されたコールバック関数は自動的にhost要素がbindされることに注意してください。

```ts
@customElement('my-element')
class MyElement extends LitElement {

  render() {
    // refディレクティブにchangeコールバックを渡します。
    return html`<input ${ref(this.inputChanged)}>`;
  }

  inputChanged(input?: HTMLInputElement) {
    input?.focus();
  }
}
```

詳しくは[こちら](https://lit.dev/playground/#sample=examples/directive-ref)を見てください。

## 非同期レンダリング

### until

1つ以上のPromiseが解決するまでプレースホルダのコンテンツをレンダリングします。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {until} from 'lit/directives/until.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
until(...values: unknown[])
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

すべてのエクスプレッション

</td>
</tr>
</tbody>
</table>

`until`はPromiseを含む複数の値を引数に取ります。
引数は優先順位が高い値から低い値の順に指定します。
優先順位が高いものに未解決のPtomiseがあった場合、優先順位が低い引数の値でPromiseでない値や解決済みの値がレンダリングされます。

この引数の値の優先順位は非同期でデータを取得する間のプレイスホルダのコンテンツを生成することに利用することができます。
例えば、
解決に時間がかかるPromiseを第1引数(優先順位が1番高い)として渡します。
非Promiseのローディングインディケータテンプレートを第2引数(優先順位が低い)として渡します。
すると、ローディングインディケータはすぐにレンダリングされます。
そして、Promiseが解決されると優先順位が1番高いコンテンツがレンダリングされます。

```ts
@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private content = fetch('./content.txt').then(r => r.text());

  render() {
    return html`${until(this.content, html`<span>Loading...</span>`)}`;
  }
}
```

詳しくは[こちら](https://lit.dev/playground/#sample=examples/directive-until)を見てください。

### asyncAppend

[AsyncIterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncIterator)から値を得る毎にそれをDOMに追記していきます。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {asyncAppend} from 'lit/directives/async-append.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
asyncAppend(iterable: AsyncIterable)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

[Child expression](https://japanese-document.github.io/lit/templates-expressions.html#Child_expressions)

</td>
</tr>
</tbody>
</table>

`asyncAppend`は[async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)の各値をレンダリングします。
各値は1つ前の値の後に追記されていきます。
[AsyncGenerator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator)は[async iterable protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_async_iterator_and_async_iterable_protocols)を実装しています。
だから、下記のように`asyncAppend`に渡すことができます。

```ts
async function *tossCoins(count: number) {
  for (let i=0; i<count; i++) {
    yield Math.random() > 0.5 ? 'Heads' : 'Tails';
    await new Promise((r) => setTimeout(r, 1000));
  }
}

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private tosses = tossCoins(10);

  render() {
    return html`
      <ul>${asyncAppend(this.tosses, (v: string) => html`<li>${v}</li>`)}</ul>`;
  }
}
```

詳しくは[こちら](https://lit.dev/playground/#sample=examples/directive-async-append)を見てください。

### asyncReplace

`AsyncIterable`から得た最新の値をDOMにレンダリングします。値を得る度、１つ前の値のレンダリング結果と置き換えます。

<table>
<thead><tr><th></th><th></th></tr></thead>
<tbody>
<tr>
<td>Import</td>
<td>

```js
import {asyncReplace} from 'lit/directives/async-replace.js';
```

</td>
</tr>
<tr>
<td>API</td>
<td>

```ts
asyncReplace(iterable: AsyncIterable)
```

</td>
</tr>
<tr>
<td>使用可能な場所</td>
<td>

[Child expression](https://japanese-document.github.io/lit/templates-expressions.html#Child_expressions)

</td>
</tr>
</tbody>
</table>

`asyncReplace`は[async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)の各値をレンダリングする点が[`asyncAppend`](#asyncAppend)と似ています。
`asyncReplace`は`AsyncIterable`から得た1つ前の値を最新の値に置き換えます。

```ts
async function *countDown(count: number) {
  while (count > 0) {
    yield count--;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

@customElement('my-element')
class MyElement extends LitElement {

  @state()
  private timer = countDown(10);

  render() {
    return html`Timer: <span>${asyncReplace(this.timer)}</span>.`;
  }
}
```

詳しくは[こちら](https://lit.dev/playground/#sample=examples/directive-async-replace)を見てください。

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