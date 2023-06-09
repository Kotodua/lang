async function getFileList() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
  console.log(params);
  const response = await fetch('https://api.github.com/repos/Kotodua/lang/contents/words-sets', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${params.token}`
    }
  });
  const data = await response.json();
  return data;
}

getFileList().then(data => {
    const select = document.getElementById('file-select')

    data.forEach(file => {
        const option = document.createElement('option');
        option.value = file.name;
        option.innerHTML = file.name;
        select.appendChild(option);
    })

}).catch(error => {
  console.error(error); // handle any errors that occurred
});

async function openSelectedFile() {
   const fileList = await getFileList();
  //


  const selectedFile = document.getElementById('file-select').value;
  if (selectedFile !== '') {
    const file = fileList.find((f) => f.name === selectedFile);
    if (file) {
      // window.open(file.download_url);

        const response = await fetch(file.download_url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvData = e.target.result;
            createTableFromCSV(csvData);
        };
        reader.readAsText(blob);
    }
  }
}

document.getElementById('csvFile').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvData = e.target.result;
            createTableFromCSV(csvData);
        };
        reader.readAsText(file);
    }
});

function createTableFromCSV(csvData) {
    const rows = csvData.split('\n');
    const table = document.getElementById('csvTable');
    table.innerHTML = '';

    rows.forEach((row, rowIndex) => {
        const tableRow = table.insertRow(-1);
        const cells = row.split('|');

        cells.forEach((cell, cellIndex) => {
            const tableCell = rowIndex === 0 ? document.createElement('th') : document.createElement('td');
            const contentSpan = document.createElement('span');
            contentSpan.innerText = cell;
            tableCell.appendChild(contentSpan);

            if (rowIndex !== 0) {
                const hiddenSpan = document.createElement('span');
                hiddenSpan.classList.add('hidden');
                hiddenSpan.innerText = '□□□□□'; // Placeholder text when the content is hidden
                tableCell.appendChild(hiddenSpan);

                tableCell.addEventListener('click', () => {
                    contentSpan.classList.toggle('hidden');
                    hiddenSpan.classList.toggle('hidden');
                });
            }

            if (rowIndex === 0) {
                tableRow.appendChild(tableCell).outerHTML = tableCell.outerHTML;
            } else {
                tableRow.appendChild(tableCell);
            }
        });
    });
}

document.getElementById('applyHiddenColumns').addEventListener('click', () => {
    const hiddenColumnsInput = document.getElementById('hiddenColumns').value;
    const hiddenColumns = hiddenColumnsInput.split(' ').map(Number);
    applyHiddenColumns(hiddenColumns);
});

function applyHiddenColumns(hiddenColumns) {
    const table = document.getElementById('csvTable');
    for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
        const row = table.rows[rowIndex];
        for (let cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
            const cell = row.cells[cellIndex];
            const contentSpan = cell.querySelector('span:not(.hidden)');
            const hiddenSpan = cell.querySelector('.hidden');

         if (hiddenColumns.includes(cellIndex + 1) && rowIndex !== 0) {
            console.log(contentSpan.textContent)
                if (!contentSpan.classList.contains('hidden') && contentSpan.textContent !== '□□□□□') {
                    contentSpan.classList.add('hidden');
                    hiddenSpan.classList.remove('hidden');
                }
            /*} else if (!hiddenColumns.includes(cellIndex + 1) && rowIndex !== 0) {
                if (contentSpan.classList.contains('hidden') && hiddenSpan.classList.contains('hidden')) {
                    contentSpan.classList.remove('hidden');
                    hiddenSpan.classList.add('hidden');
                }*/
            }
        }
    }
}