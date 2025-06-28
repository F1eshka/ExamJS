window.addEventListener('hashchange', () => {
    selectPage();
});

document.addEventListener('DOMContentLoaded', () => {
    selectPage();
});

function selectPage() {
    const route = window.location.hash.split('/');
    switch (route[0]) {
        case '':
        case '#home':
            homePage();
            break;
        case '#rate':
            ratePage(route[1]);
            break;
        default:
            notFoundPage();
    }
}

function m(val) {
    return val < 10 ? `0${val}` : val;
}

function getTodayDate() {
    const d = new Date();
    return `${d.getFullYear()}-${m(d.getMonth() + 1)}-${m(d.getDate())}`;
}

function homePage(date) {
    if (!date) {
        date = getTodayDate(); 
    }

    const formattedDate = date.replaceAll('-', ''); 

    fetch(`https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?date=${formattedDate}&json`)
        .then(r => r.json())
        .then(j => {
            const main = document.getElementById('main-block');
            main.innerHTML = ''; 

            const container = document.createElement('div');
            container.className = 'container mt-4';

            const [yyyy, mm, dd] = date.split('-');
            const title = document.createElement('h3');
            title.className = 'mb-3';
            title.textContent = `Курси валют на ${dd}.${mm}.${yyyy}`;
            container.appendChild(title);

            const dateGroup = document.createElement('div');
            dateGroup.className = 'mb-3';

            const dateLabel = document.createElement('label');
            dateLabel.className = 'form-label';
            dateLabel.setAttribute('for', 'rate-date');
            dateLabel.textContent = 'Оберіть дату:';

            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.id = 'rate-date';
            dateInput.className = 'form-control w-auto';
            dateInput.value = date;
            dateInput.max = getTodayDate();
            dateInput.onchange = (e) => homePage(e.target.value);

            dateGroup.appendChild(dateLabel);
            dateGroup.appendChild(dateInput);
            container.appendChild(dateGroup);

            const table = document.createElement('table');
            table.className = 'table table-striped table-hover';

            const thead = document.createElement('thead');
            thead.className = 'table-dark';
            thead.innerHTML = `<tr><th>Код</th><th>Назва</th><th>Курс (₴)</th></tr>`;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            for (let r of j) {
                const tr = document.createElement('tr');
                tr.setAttribute('data-cc', r.cc);
                tr.innerHTML = `<td>${r.cc}</td><td>${r.txt}</td><td>${r.rate.toFixed(2)}</td>`;
                tr.onclick = rateClick;
                tbody.appendChild(tr);
            }

            table.appendChild(tbody);
            container.appendChild(table);

            main.appendChild(container);
        });
}


function rateClick(e) {
    const row = e.target.closest('[data-cc]');
    if (row) {
        const cc = row.getAttribute('data-cc');
        window.location.hash = "#rate/" + cc;
    }
}

function ratePage(cc) {
    if (typeof cc == 'undefined') {
        cc = 'USD';
    }
    const date1 = new Date();
    const date2 = new Date(date1.getTime() - 604800000);  // 7 днів
    const d1 = `${date1.getFullYear()}${m(date1.getMonth()+1)}${m(date1.getDate())}`;
    const d2 = `${date2.getFullYear()}${m(date2.getMonth()+1)}${m(date2.getDate())}`;
    const url = `https://bank.gov.ua/NBU_Exchange/exchange_site?start=${d2}&end=${d1}&valcode=${cc.toLowerCase()}&sort=exchangedate&order=desc&json`;

    fetch(url)
        .then(r => r.json())
        .then(j => {
            const main = document.getElementById('main-block');
            main.innerHTML = `<h3>Курс ${cc} за останній тиждень:</h3>`;
            for (let r of j) {
                const p = document.createElement('p');
                p.textContent = `${r.exchangedate}: ${r.rate}`;
                main.appendChild(p);
            }
            const back = document.createElement('button');
            back.textContent = 'Назад';
            back.onclick = () => window.location.hash = '#home';
            main.appendChild(back);
        });
}

function notFoundPage() {
    document.getElementById('main-block').textContent = 'Сторінку не знайдено';
}
