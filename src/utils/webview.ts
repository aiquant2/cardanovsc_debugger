export function getLoadingHtml(address: string): string {
    return wrapHtml(`<p>🔍 Fetching UTXOs for <code>${address}</code>...</p>`);
  }
  
  export function wrapHtml(innerHtml: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 16px;
            color: #333;
            background: #f9f9f9;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }
          code {
            background: #eaeaea;
            padding: 2px 4px;
            border-radius: 4px;
          }
          code.highlight {
            background-color: black;
            color: white;
            padding: 2px 4px;
            border-radius: 4px;
          }
          pre {
            background: #eee;
            padding: 10px;
            overflow-x: auto;
            border-left: 4px solid #007acc;
          }
          h2, h3 {
            color: #007acc;
          }
          main {
            flex: 1;
          }
          footer {
            text-align: center;
            padding: 12px;
            color: white;
            background: linear-gradient(90deg, #0066cc, #3399ff);
            font-size: 0.9em;
            border-top: 1px solid #ccc;
          }
        </style>
      </head>
      <body>
        <main>
          ${innerHtml}
        </main>
        <footer>
          CardanoVSC Debugger, AIQUANT TECHNOLOGIES
        </footer>
      </body>
      </html>
    `;
  }
  
  export function buildUtxoHtml(utxo: any, datumHtml: string): string {
    const amounts = utxo.amount
      .map((a: any) => `${a.quantity} ${a.unit}`)
      .join("<br/>");
  
    return wrapHtml(`
      <h2>📦 Latest UTXO</h2>
      <p><strong>Tx Hash:</strong> <code class="highlight">${utxo.tx_hash}</code></p>
      <p><strong>Tx Index:</strong> ${utxo.output_index}</p>
      <p><strong>Amount:</strong><br/> ${amounts}</p>
      ${datumHtml}
    `);
  }
  