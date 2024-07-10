const spreadsheetId = '1wUj8w1DqhljhcG2-aILNi44P4o6WYTFM4xtE4tM4v7s';
const sheetName = 'StaffDetails';
const range = `${sheetName}!A5:F`;

const API_Key = `AIzaSyDvw1aGRAOO0UIySjIFcxW1gyrVQAeL9vo`;
const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${API_Key}`;

const googleAppsScriptURL = `https://script.google.com/macros/s/AKfycby0OMB-7takl3IizBvyDoDrrTXlWaTX8CnE2X_jIdlCt3Ade0P76ramoEu93wNeKZiVRg/exec`;

const dangerColor = 'red';
const warningColor = 'orange';
const successColor = 'green';

$(document).ready(function() {

    $('#toggle-login').click(function() {
        toggleToLoginForm();
    });

    $('#toggle-registration').click(function() {
        toggleToRegistrationForm();
    });

    $('#login-form').submit(async function(e) {
        e.preventDefault();

        let UserID = $('#LoginID').val();
        let AccessCode = $('#Password').val();
        let user = null;

        user = await login(UserID, AccessCode);
        var isAuthorized = (user==null?false:true);

        if (isAuthorized) {
            let userData = {
                UserID: user.UserID,
                Name: user.Name,
                Email: user.Email,
                Mobile: user.Mobile,
                Subject: user.Subject
            };
            sessionStorage.setItem('UserData', JSON.stringify(userData));

            $('#login-message').show().text('Login successful!').css("color", successColor);
            setTimeout(function() {
                $('#login-message').fadeOut(1000, function() {
                    $('#login-message').text('');
                    document.getElementById('login-form').reset();

                    $.ajax({
                        url: 'dashboard.html',
                        type: 'GET',
                        success: function(response) {
                            $('body').html(response);
                        },
                        error: function() {
                            console.log('Error loading new page content');
                            alert('Unexpected error in page rendering.');
                        }
                    });
                });
            }, 500);
        }
    });

    $('#registration-form').submit(async function(e) {
        e.preventDefault();
        
        let userData = {
            UserID: $('#UserID').val(),
            Name: $('#Name').val(),
            AccessCode: $('#AccessCode').val(),
            Email: $('#Email').val(),
            Mobile: $('#Mobile').val(),
            Subject: $('#Subject').val()
        };

        let isRegistered = await register(userData);
        if (isRegistered) {
            $('#registration-message').show().text('Registered successfully !').css('color', successColor);
            setTimeout(function() {
                $('#registration-message').fadeOut(1000, function() {
                    $('#registration-message').text('');
                    document.getElementById('registration-form').reset();
                    toggleToLoginForm();
                });
            }, 500);
        }
    });
});

function toggleToLoginForm() {
    document.getElementById('registration-form').reset();
    $('.form-login').show();
    $('.form-registration').hide();
    $('#toggle-login').addClass('active');
    $('#toggle-registration').removeClass('active');
}

function toggleToRegistrationForm() {
    document.getElementById('login-form').reset();
    $('.form-login').hide();
    $('.form-registration').show();
    $('#toggle-registration').addClass('active');
    $('#toggle-login').removeClass('active');
}

async function login(UserID, AccessCode) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        const values = data.values;

        if (values && values.length) {
            const tableHeaders = values[0];
            const UserIDIndex = tableHeaders.indexOf('UserID');
            if (UserIDIndex !== -1) {
                const recordID = values.findIndex(row => row[UserIDIndex] === UserID);
                if (recordID !== -1) {
                    const record = values[recordID];
                    const entity = {};
                    tableHeaders.forEach((attribute, idx) => {
                        entity[attribute] = record[idx];
                    });
                    if (entity.AccessCode === AccessCode) {
                        entity.AccessCode = '';
                        return entity;
                    } else {
                        $('#login-message').show().text('Incorrect password !').css("color", dangerColor);
                        setTimeout(function() {
                            $('#login-message').fadeOut(1000, function() {
                                $('#login-message').text('');
                                $('#Password').val('');
                            });
                        }, 500);
                    }
                } else {
                    $('#login-message').show().text(`UserID ${UserID} not found !`).css("color", warningColor);
                    setTimeout(function() {
                        $('#login-message').fadeOut(1000, function() {
                            $('#login-message').text('');
                            document.getElementById('login-form').reset();
                        });
                    }, 500);
                }
            } else {
                $('#login-message').show().text('No UserID attribute in DB !').css("color", dangerColor);
                setTimeout(function() {
                    $('#login-message').fadeOut(1000, function() {
                        $('#login-message').text('');
                        document.getElementById('login-form').reset();
                    });
                }, 500);
            }
        } else {
            $('#login-message').show().text('No data in DB !').css("color", dangerColor);
            setTimeout(function() {
                $('#login-message').fadeOut(1000, function() {
                    $('#login-message').text('');
                    document.getElementById('login-form').reset();
                });
            }, 500);
        }
        return null;
    } catch (error) {
        $('#login-message').show().text('DB connection error !').css("color", dangerColor);
        setTimeout(function() {
            $('#login-message').fadeOut(1000, function() {
                $('#login-message').text('');
                document.getElementById('login-form').reset();
            });
        }, 500);
        return null;
    }
}

async function register(userData) {
    const isUserAlreadyRegistered = (async () => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const values = data.values;

            if (values && values.length) {
                const tableHeaders = values[0];
                const UserIDIndex = tableHeaders.indexOf('UserID');
                const EmailIndex = tableHeaders.indexOf('Email');
                const MobileIndex = tableHeaders.indexOf('Mobile');

                if (UserIDIndex !== -1 && EmailIndex !== -1 && MobileIndex !== -1) {
                    const UserIDRecordID = values.findIndex(row => row[UserIDIndex] === userData.UserID);
                    const EmailRecordID = values.findIndex(row => row[EmailIndex] === userData.Email);
                    const MobileRecordID = values.findIndex(row => row[MobileIndex] === userData.Mobile);
                    if (UserIDRecordID !== -1) {
                        $('#registration-message').show().text('UserID already taken !').css("color", dangerColor);
                        setTimeout(function() {
                            $('#registration-message').fadeOut(1000, function() {
                                $('#registration-message').text('');
                                $('#UserID').val('');
                            });
                        }, 500);
                        return true;
                    } else if(EmailRecordID !== -1) {
                        $('#registration-message').show().text(`Email already registered as ${values[EmailRecordID][0]} !`).css("color", dangerColor);
                        setTimeout(function() {
                            $('#registration-message').fadeOut(1000, function() {
                                $('#registration-message').text('');
                                document.getElementById('registration-form').reset();
                                toggleToLoginForm();
                            });
                        }, 500);
                        return true;
                    } else if(MobileRecordID !== -1) {
                        $('#registration-message').show().text(`Mobile already registered as ${values[MobileRecordID][0]} !`).css("color", dangerColor);
                        setTimeout(function() {
                            $('#registration-message').fadeOut(1000, function() {
                                $('#registration-message').text('');
                                document.getElementById('registration-form').reset();
                                toggleToLoginForm();
                            });
                        }, 500);
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    $('#registration-message').show().text('No UserID/Email/Mobile attribute in DB !').css("color", dangerColor);
                    setTimeout(function() {
                        $('#registration-message').fadeOut(1000, function() {
                            $('#registration-message').text('');
                            document.getElementById('registration-form').reset();
                        });
                    }, 500);
                    return null;
                }
            } else {
                $('#registration-message').show().text('No data in DB !').css("color", dangerColor);
                setTimeout(function() {
                    $('#registration-message').fadeOut(1000, function() {
                        $('#registration-message').text('');
                        document.getElementById('registration-form').reset();
                    });
                }, 500);
                return null;
            }
        } catch (error) {
            $('#registration-message').show().text('DB connection error !').css("color", dangerColor);
            setTimeout(function() {
                $('#registration-message').fadeOut(1000, function() {
                    $('#registration-message').text('');
                    document.getElementById('registration-form').reset();
                });
            }, 500);
            return null;
        }
    });

    if (await isUserAlreadyRegistered()) {
        return false;
    } else {
        return await appendRecordToGoogleSpreadsheet(userData);
    }
}

async function appendRecordToGoogleSpreadsheet(userData) {
    const registrationForm = document.querySelector('#registration-form');
    try {
        const response = await fetch(googleAppsScriptURL, {
            method: 'POST',
            mode: 'no-cors',
            body: new FormData(registrationForm)
        });
        return true;
    } catch (error) {
        $('#registration-message').show().text('Error registering data to DB !').css("color", dangerColor);
        setTimeout(function() {
            $('#registration-message').fadeOut(1000, function() {
                $('#registration-message').text('');
                document.getElementById('registration-form').reset();
            });
        }, 500);
        return false;
    }
}