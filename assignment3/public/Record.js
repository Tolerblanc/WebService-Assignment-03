class Record {
    template() {
        return `
            <h1>Record</h1>
            <p id="record">로딩 중...</p>
        `;
    }

    updateRecord() {
        fetch('/user/records', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('HTTP error, status = ' + response.status);
                }
                let json = await response.json();
                const { id, wins, losses } = json;
                const winRate = wins + losses ? ((wins / (wins + losses)) * 100).toFixed(2) : 0;

                document.getElementById('record').innerHTML = `
                ${id}님의 전적 <br>
                Wins: ${wins} <br>
                Losses: ${losses} <br>
                Win Rate: ${winRate}%
            `;
            })
            .catch((error) => {
                document.getElementById('record').innerHTML = '데이터를 불러오는 데 실패했습니다.';
            });
    }
}
export default new Record();
