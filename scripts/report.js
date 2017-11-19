var reporter = require('cucumber-html-reporter');
 
var options = {
        theme: 'bootstrap',
        jsonFile: 'features/reports/test-report.json',
        output: 'features/reports/test-report.html',
        reportSuiteAsScenarios: true,
        launchReport: false,
        metadata: {
            "Report Generated On": (new Date()).toLocaleString()
        }
    };
 
reporter.generate(options);