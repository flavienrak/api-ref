const verificationMailTemplate = (data: { name: string; code: number }) => {
  return `
    <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Mail</title>
          <style>
            * {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .h-full {
              height: 100%;
            }
            .w-full {
              width: 100%;
            }
            .flex {
              display: flex;
            }
            .flex-col {
              flex-direction: column;
            }
            .justify-center {
              justify-content: center;
            }
            .items-center {
              align-items: center;
            }
            .bg-white {
              background: #ffffff;
            }
            .bg-primary {
              background: #f3f4f6;
            }
            .bg-secondary {
              background: #cffafe;
            }
            .text-center {
              text-align: center;
            }
            .text-xl {
              font-size: 2rem;
            }
            .text-base {
              font-size: 1rem;
            }
            .tracking-wide {
              letter-spacing: 0.5rem;
            }
            .font-semibold {
              font-weight: 600;
            }
            .gap-4 {
              gap: 1rem;
            }
            .p-10 {
              padding: 10%;
            }
            .py-4 {
              padding: 1rem;
            }
            .px-4 {
              padding: 1rem;
            }
            .py-8 {
              padding: 2rem;
            }
            .px-8 {
              padding: 2rem;
            }
            .rounded-md {
              border-radius: 0.5rem;
            }
            .rounded-xl {
              border-radius: 1rem;
            }
            .max-w-80 {
              max-width: 80%;
            }
          </style>
        </head>
        <body class="w-full flex justify-center items-center py-8 px-8 bg-primary">
          <div class="max-w-80 w-full flex-col rounded-xl bg-white py-4 px-8">
            <h1>Code de validation</h1>
            <p class="text-base">Bonjour ${data.name}, votre code de validation est :</p>
            <div class="flex justify-center rounded-md px-8 bg-secondary">
              <p class="text-xl tracking-wide font-semibold">${data.code}</p>
            </div>
          </div>
        </body>
      </html>
  `;
};

export { verificationMailTemplate };
