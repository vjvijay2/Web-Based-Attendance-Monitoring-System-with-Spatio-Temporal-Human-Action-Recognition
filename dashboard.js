const dashBoardSpreadsheetId = '1wUj8w1DqhljhcG2-aILNi44P4o6WYTFM4xtE4tM4v7s';
const dashBoardSheetName = 'Report';
const dashBoardRange = `${dashBoardSheetName}!A5:E`;

const dashBoardAPI_Key = `AIzaSyDvw1aGRAOO0UIySjIFcxW1gyrVQAeL9vo`;
const dashBoardUrl = `https://sheets.googleapis.com/v4/spreadsheets/${dashBoardSpreadsheetId}/values/${dashBoardRange}?key=${dashBoardAPI_Key}`;

const dangerColor2 = 'red';
const warningColor2 = 'orange';
const successColor2 = 'green';

$(document).ready(function () {

    $('#toggle-search-student').click(function() {
        toggleToStudentSearchForm();
    });

    $('#toggle-search-date').click(function() {
        toggleToDateSearchForm();
    });

    let UserData = JSON.parse(sessionStorage.getItem('UserData'));

    displayStaffWelcome(UserData.Name);
    displayDashboard();

    $('#student-result').hide();

    $('#student-search-btn').click(function () {
        searchByStudent();
    });
    $('#student-search-query').keypress(function(e) {
        if (e.which == 13) {
            $('#student-search-btn').click();
        }
    });

    $('#date-search-btn').click(function () {
        searchByDate();
    });
    $('#date-search-query').keypress(function(e) {
        if (e.which == 13) {
            $('#date-search-btn').click();
        }
    });

    $('#logout-btn').click(function() {
        sessionStorage.removeItem('UserData');
        window.location.href = 'index.html';
    });
});

function toggleToStudentSearchForm() {
    $('#date-search-query').val('');
    $('#student-report').show();
    $('#date-report').hide();
    $('#toggle-search-student').addClass('active');
    $('#toggle-search-date').removeClass('active');

    $('#student-result').hide();
    $('#date-result').hide();
}

function toggleToDateSearchForm() {
    $('#student-search-query').val('');
    $('#date-report').show();
    $('#student-report').hide();
    $('#toggle-search-date').addClass('active');
    $('#toggle-search-student').removeClass('active');

    $('#student-result').hide();
    $('#date-result').hide();
}

function displayStaffWelcome(Name) {
    $('#Name').text(Name);
}

function displayDashboard() {
    toggleToStudentSearchForm();

    $('#date-report').hide();
    $('#student-report').show();
    $('#student-result').hide();
    $('#date-result').hide();
}

async function searchByStudent() {
    let searchQuery = $('#student-search-query').val();

    $('#student-result-table').empty();
    let studentRecords = await getStudentRecords(searchQuery);

    if (studentRecords !== null) {
        $('#result-name').show();
        $('#student-search-message').show().text(`Search successful !`).css("color", successColor2);
        setTimeout(function() {
            $('#student-search-message').fadeOut(1000, function() {
                $('#student-search-message').text('');
                $('#student-search-query').val('');
            });
        }, 500);
        populateTable(studentRecords, 'Student');
    } else {
        console.log("Records fetched is null");
    }
}

async function searchByDate() {
    let searchQuery = $('#date-search-query').val();

    $('#date-result-table').empty();
    let dateRecords = await getDateRecords(searchQuery);

    if (dateRecords !== null) {
        $('#result-date').show();
        $('#date-search-message').show().text(`Search successful !`).css("color", successColor2);
        setTimeout(function() {
            $('#date-search-message').fadeOut(1000, function() {
                $('#date-search-message').text('');
                $('#date-search-query').val('');
            });
        }, 500);
        populateTable(dateRecords, 'Date');
    } else {
        console.log("Records fetched is null");
    }
}

async function getDateRecords(date_input) {
    try {
        const response = await fetch(dashBoardUrl);
        const data = await response.json();
        const values = data.values;
        if (values && values.length) {
            const tableHeaders = values[0];
            const DateIndex = tableHeaders.indexOf('Date');
            if (DateIndex !== -1) {
                const matches = values.filter(row => row[DateIndex] === date_input);
                if (matches.length > 0) {
                    const records = [];
                    matches.forEach(row => {
                        const entity = {};
                        tableHeaders.forEach((header, idx) => {
                            entity[header] = row[idx];
                        });
                        records.push(entity);
                    });
                    return records;
                } else {
                    $('#result-date').hide();
                    $('#date-search-message').show().text(`Date ${date_input} not found in DB !`).css("color", dangerColor2);
                    setTimeout(function() {
                        $('#date-search-message').fadeOut(1000, function () {
                            $('#date-search-message').text('');
                            $('#date-search-query').val('');
                        });
                    }, 500);
                    return null;
                }
            } else {
                $('#result-date').hide();
                $('#date-search-message').show().text('No Date attribute in DB !').css("color", dangerColor2);
                setTimeout(function() {
                    $('#date-search-message').fadeOut(1000, function() {
                        $('#date-search-message').text('');
                        $('#date-search-query').val('');
                    });
                }, 500);
                return null;
            }
        } else {
            $('#result-date').hide();
            $('#date-search-message').show().text('No data in DB !').css("color", dangerColor2);
            setTimeout(function() {
                $('#date-search-message').fadeOut(1000, function() {
                    $('#date-search-message').text('');
                    $('#date-search-query').val('');
                });
            }, 500);
            return null;
        }
    } catch (error) {
        console.error(error);
        $('#result-date').hide();
        $('#date-search-message').show().text('DB connection error !').css("color", dangerColor2);
        setTimeout(function() {
            $('#date-search-message').fadeOut(1000, function() {
                $('#date-search-message').text('');
                $('#date-search-query').val('');
            });
        }, 500);
        return null;
    }
}

async function getStudentRecords(student_input) {
    try {
        const response = await fetch(dashBoardUrl);
        const data = await response.json();
        const values = data.values;
        if (values && values.length) {
            const tableHeaders = values[0];
            const NameIndex = tableHeaders.indexOf('Name');
            if (NameIndex !== -1) {
                const matches = values.filter(row => row[NameIndex] === student_input);
                if (matches.length > 0) {
                    const records = [];
                    matches.forEach(row => {
                        const entity = {};
                        tableHeaders.forEach((header, idx) => {
                            entity[header] = row[idx];
                        });
                        records.push(entity);
                    });
                    return records;
                } else {
                    $('#result-name').hide();
                    $('#student-search-message').show().text(`Name ${student_input} not found in DB !`).css("color", dangerColor2);
                    setTimeout(function() {
                        $('#student-search-message').fadeOut(1000, function () {
                            $('#student-search-message').text('');
                            $('#student-search-query').val('');
                        });
                    }, 500);
                    return null;
                }
            } else {
                $('#result-name').hide();
                $('#student-search-message').show().text('No Name attribute in DB !').css("color", dangerColor2);
                setTimeout(function() {
                    $('#student-search-message').fadeOut(1000, function() {
                        $('#student-search-message').text('');
                        $('#student-search-query').val('');
                    });
                }, 500);
                return null;
            }
        } else {
            $('#result-name').hide();
            $('#student-search-message').show().text('No data in DB !').css("color", dangerColor2);
            setTimeout(function() {
                $('#student-search-message').fadeOut(1000, function() {
                    $('#student-search-message').text('');
                    $('#student-search-query').val('');
                });
            }, 500);
            return null;
        }
    } catch (error) {
        console.error(error);
        $('#result-name').hide();
        $('#student-search-message').show().text('DB connection error !').css("color", dangerColor2);
        setTimeout(function() {
            $('#student-search-message').fadeOut(1000, function() {
                $('#student-search-message').text('');
                $('#student-search-query').val('');
            });
        }, 500);
        return null;
    }
}

function populateTable(results, tableID) {
    let table = null;
    if (tableID === 'Student') {
        table = $('#student-result-table');
        table.empty();
        $('#student-result').show();
        $('#result-name').text(results[0].Name);

        let studentInfo = '<tr class="result-table-head"><th colspan="5">';
        studentInfo += results[0].Name;
        studentInfo += '</th></tr>';
        // table.append(studentInfo);
    }
    if (tableID === 'Date') {
        table = $('#date-result-table');
        table.empty();
        $('#date-result').show();
        $('#result-date').text(results[0].Date);

        let dateInfo = '<tr class="result-table-head"><th colspan="5">';
        dateInfo += results[0].Date;
        dateInfo += '</th></tr>';
        // table.append(dateInfo);
    }

    let tableHeader = '<thead><tr class="table-header"><th>Date</th><th>Name</th><th>Subject</th><th>Status</th><th>TimeIn</th></tr></thead>';
    table.append(tableHeader);

    results.forEach(function (result) {
        var row = '<tr';
        if (result.Status === 'present' || result.Status === 'Present') {
            row += ' class="present"';
        } else if (result.Status === 'absent' || result.Status === 'Absent') {
            row += ' class="absent"';
        }
        row += '>';
        row += '<td>' + result['Date'] + '</td>';
        row += '<td>' + result['Name'] + '</td>';
        row += '<td>' + result['Department'] + '</td>';
        row += '<td>' + result['Status'] + '</td>';
        row += '<td>' + result['Time'] + '</td>';
        row += '</tr>';
        table.append(row);
    });
    table.show();
}