export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>ribeirlabs / marked</h1>
      <form method="post" action="/mark">
        <input type="hidden" name="link" value="https://twitter.com" />
        <button>Go</button>
      </form>
    </div>
  );
}
