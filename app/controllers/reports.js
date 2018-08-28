"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("underscore");
const sql = require("mssql");
const moment = require("moment");
const fs = require("fs");
const createDebug = require("debug");
const yaml = require("js-yaml");
const json2csv = require("json2csv");
const configs = require('../configs/app.js');
const jconv = require('jconv');
const debug = createDebug('ttts-backend:controllers:report');
// 改行コード(CR+LF)
const CSV_DELIMITER = '\t';
const CSV_LINE_ENDING = '\r\n';
const RESERVATION_START_DATE = process.env.RESERVATION_START_DATE;
/**
 * The main processing function is used to output the csv file
 * @param req
 * @param res
 */
function getSales(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // conditions initialize
        const prmConditons = {
            reportType: getValue(req.query.reportType),
            performanceDayFrom: getValue(req.query.dateFrom),
            performanceDayTo: getValue(req.query.dateTo),
            eventStartFrom: getValue(req.query.eventStartFrom),
            eventStartThrough: getValue(req.query.eventStartThrough)
        };
        //Check the data transmitted to the server from the client
        const errorMessage = yield validate(req);
        if (errorMessage !== '') {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.write(errorMessage);
        }
        else {
            // Get fields and fieldNames to output csv
            const csvPath = `${__dirname}/../configs/pos_sales.csv.yml`;
            const fileInfo = yaml.safeLoad(fs.readFileSync(csvPath, 'utf8'));
            // Get the sample data that satisfies the conditions contained in the sql server database
            let datas = [];
            if (prmConditons.reportType == 'performance_day' || prmConditons.reportType == 'sales_date') {
                datas = yield search4SalesDateOrPerformanceDay(prmConditons);
            }
            let fields = [];
            let fieldNames = [];
            for (let propName in fileInfo) {
                fields.push(fileInfo[propName].field);
                fieldNames.push(fileInfo[propName].field_label);
            }
            //write csv file
            let filename = moment().format('YYYYMMDD_HHMMSS');
            const output = json2csv({
                data: datas,
                fields: fields,
                fieldNames: fieldNames,
                del: CSV_DELIMITER,
                newLine: CSV_LINE_ENDING,
                quotes: '"',
                defaultValue: '',
                flatten: true,
                preserveNewLinesInValues: true
            });
            debug(`writing ${output.length} character(s) to response...`);
            res.setHeader('Content-disposition', `attachment; filename*=UTF-8\'\'${encodeURIComponent(`${filename}.tsv`)}`);
            res.setHeader('Content-Type', 'text/csv; charset=Shift_JIS');
            res.write(jconv.convert(output, 'UTF8', 'SJIS'));
        }
        res.end();
    });
}
exports.getSales = getSales;
/**
 * Search for pos_sales in sql server
 * @param searchConditions
 */
function search4SalesDateOrPerformanceDay(searchConditions) {
    return __awaiter(this, void 0, void 0, function* () {
        let sqlString = `SELECT * FROM pos_sales WHERE 1 = 1`;
        sqlString = searchConditions.reportType == 'sales_date' ? createTime4SalesDate(sqlString, searchConditions) : createTime4PerformanceDay(sqlString, searchConditions);
        const pool = yield new sql.ConnectionPool(configs.mssql).connect();
        const posSales = yield pool.request().query(sqlString).then(docs => docs.recordset.map(doc => {
            doc.start_time = moment(doc.start_time).format('HH:mm');
            return (posSales2Data(doc));
        }));
        debug(`${posSales.length} pos_sales found.`);
        return posSales;
    });
}
/**
 * make search conditions for sales_date
 * @param sqlString
 * @param searchConditions
 */
function createTime4SalesDate(sqlString, searchConditions) {
    if (searchConditions.performanceDayFrom !== null || searchConditions.performanceDayTo !== null) {
        let salesDateConds = [];
        if (searchConditions.performanceDayFrom !== null) {
            const minEndFrom = (RESERVATION_START_DATE !== undefined) ? moment(RESERVATION_START_DATE) : moment('2017-01-01');
            const endFrom = moment(`${searchConditions.performanceDayFrom}`, 'YYYY/MM/DD');
            salesDateConds.push(`sales_date >= '${moment.max(endFrom, minEndFrom).format('YYYY-MM-DD')}'`);
        }
        if (searchConditions.performanceDayTo !== null) {
            salesDateConds.push(`sales_date <= '${moment(`${searchConditions.performanceDayTo}`, 'YYYY/MM/DD').format('YYYY-MM-DD')}'`);
        }
        sqlString += ` AND (${salesDateConds.join(' AND ')})`;
    }
    return sqlString;
}
/**
 * make search conditions for performance_day
 * @param sqlString
 * @param searchConditions
 */
function createTime4PerformanceDay(sqlString, searchConditions) {
    if (searchConditions.eventStartFrom !== null || searchConditions.eventStartThrough !== null) {
        let performanceDayConds = [];
        if (searchConditions.eventStartFrom !== null) {
            const minEndFrom = (RESERVATION_START_DATE !== undefined) ? moment(RESERVATION_START_DATE) : moment('2017-01-01');
            const endFrom = moment(`${searchConditions.eventStartFrom}`, 'YYYY/MM/DD');
            performanceDayConds.push(`performance_day >= '${moment.max(endFrom, minEndFrom).format('YYYYMMDD')}'`);
        }
        if (searchConditions.eventStartThrough !== null) {
            performanceDayConds.push(`performance_day <= '${moment(`${searchConditions.eventStartThrough}`, 'YYYY/MM/DD').format('YYYYMMDD')}'`);
        }
        sqlString += ` AND (${performanceDayConds.join(' AND ')})`;
    }
    return sqlString;
}
/**
 * Convert object to data of each line in csv
 * @param r IPosSalesData
 * @returns IData
 */
function posSales2Data(r) {
    return {
        store_code: r.store_code,
        pos_no: r.pos_no,
        receipt_no: r.receipt_no,
        no1: r.no1,
        no2: r.no2,
        type: r.type,
        payment_no: r.payment_no,
        performance_id: r.performance_id,
        seat_code: r.seat_code,
        performance_type: r.performance_type,
        performance_day: r.performance_day,
        start_time: r.start_time,
        sales_date: r.sales_date,
        section_code: r.section_code,
        plu_code: r.plu_code,
        item_name: r.item_name,
        sales_amount: r.sales_amount,
        unit_price: r.unit_price,
        unit: r.unit,
        sum_amount: r.sum_amount,
        payment_type: r.payment_type,
        cash: r.cash,
        payment_type1: r.payment_type1,
        payment_type2: r.payment_type2,
        payment_type3: r.payment_type3,
        payment_type4: r.payment_type4,
        payment_type5: r.payment_type5,
        payment_type6: r.payment_type6,
        payment_type7: r.payment_type7,
        payment_type8: r.payment_type8,
        customer1: r.customer1,
        customer2: r.customer2,
        entry_flg: r.entry_flg,
        entry_date: r.entry_date
    };
}
/**
 * get value input
 * @param inputValue
 */
function getValue(inputValue) {
    return (!_.isEmpty(inputValue)) ? inputValue : null;
}
/**
 * Check the data transmitted to the server from the client
 * @param req
 */
function validate(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const validatorResult = yield req.getValidationResult();
        const errors = (!validatorResult.isEmpty()) ? validatorResult.mapped : {};
        if (req.query.dateFrom && isValidDate(req.query.dateFrom) == false) {
            errors.dateFrom = { msg: '売上日付選択Fromが正しくない' };
        }
        if (req.query.dateTo && isValidDate(req.query.dateTo) == false) {
            errors.dateTo = { msg: '売上日付選択Toが正しくない' };
        }
        if (req.query.eventStartFrom && isValidDate(req.query.eventStartFrom) == false) {
            errors.eventStartFrom = { msg: '予約日付期間選択Fromが正しくない' };
        }
        if (req.query.eventStartThrough && isValidDate(req.query.eventStartThrough) == false) {
            errors.eventStartThrough = { msg: '予約日付期間選択Toが正しくない' };
        }
        let errorMessage = '';
        Object.keys(errors).forEach((key) => {
            if (errorMessage !== '') {
                errorMessage += CSV_LINE_ENDING;
            }
            errorMessage += errors[key].msg;
        });
        return errorMessage;
    });
}
/**
 * Check valid date YYYY-MM-DD
 * @param s
 */
function isValidDate(s) {
    const dateFormat = /^\d{1,4}[\/]\d{1,2}[\/]\d{1,2}$/;
    if (dateFormat.test(s)) {
        s = s.replace(/0*(\d*)/gi, "$1");
        let dateArray = s.split(/[\.|\/|-]/);
        dateArray[1] = dateArray[1] - 1;
        if (dateArray[0].length < 4) {
            dateArray[0] = (parseInt(dateArray[0]) < 50) ? 2000 + parseInt(dateArray[0]) : 1900 + parseInt(dateArray[0]);
        }
        const testDate = new Date(dateArray[0], dateArray[1], dateArray[2]);
        if (testDate.getDate() != dateArray[2] || testDate.getMonth() != dateArray[1] || testDate.getFullYear() != dateArray[0]) {
            return false;
        }
        return true;
    }
    return false;
}
//# sourceMappingURL=reports.js.map