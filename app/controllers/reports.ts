import { Request, Response } from 'express';
import * as _ from 'underscore';
import * as sql from 'mssql';
import * as moment from 'moment';
import * as fs from 'fs';
import * as createDebug from 'debug';
import * as yaml from 'js-yaml';
import * as json2csv from 'json2csv';

const configs = require ('../configs/app.js');
const jconv = require('jconv');
const debug = createDebug('ttts-backend:controllers:report');

export type ReportType = 'sales_date' | 'performance_day';

// 改行コード(CR+LF)
const CSV_DELIMITER: string = '\t';
const CSV_LINE_ENDING: string = '\r\n';
const RESERVATION_START_DATE = process.env.RESERVATION_START_DATE;

/**
 * CSVデータインターフェース
 * @interface
 */
export interface IData {
    store_code: string,
    pos_no: number,
    receipt_no: string,
    no1: number,
    no2: number,
    type: number,
    payment_no: string,
    performance_id: number,
    seat_code: string,
    performance_type: number,
    performance_day: string,
    start_time: number,
    sales_date: number,
    section_code: string,
    plu_code: string,
    item_name: string,
    sales_amount: number,
    unit_price: number,
    unit: number,
    sum_amount: number,
    payment_type: number,
    cash: number,
    payment_type1: number,
    payment_type2: number,
    payment_type3: number,
    payment_type4: number,
    payment_type5: number,
    payment_type6: number,
    payment_type7: number,
    payment_type8: number,
    customer1: number,
    customer2: string,
    entry_flg: string,
    entry_date: string
}

/**
 * @interface
 */
export interface IPosSalesData {
    id: number,
    store_code: string,
    pos_no: number,
    receipt_no: string,
    no1: number,
    no2: number,
    type: number,
    payment_no: string,
    performance_id: number,
    seat_code: string,
    performance_type: number,
    performance_day: string,
    start_time: number,
    sales_date: number,
    section_code: string,
    plu_code: string,
    item_name: string,
    sales_amount: number,
    unit_price: number,
    unit: number,
    sum_amount: number,
    payment_type: number,
    cash: number,
    payment_type1: number,
    payment_type2: number,
    payment_type3: number,
    payment_type4: number,
    payment_type5: number,
    payment_type6: number,
    payment_type7: number,
    payment_type8: number,
    customer1: number,
    customer2: string,
    entry_flg: string,
    entry_date: string
}

export interface ISearchSalesConditions {
    reportType: ReportType | null;
    //sales_date
    performanceDayFrom: string | null;
    performanceDayTo: string | null;
    //performance_day
    eventStartFrom: string | null;
    eventStartThrough: string | null;
}

/**
 * The main processing function is used to output the csv file
 * @param req 
 * @param res 
 */
export async function getSales(req: Request, res: Response): Promise<void> {
    // conditions initialize
    const prmConditons: ISearchSalesConditions = {
        reportType: <ReportType>getValue(req.query.reportType),
        performanceDayFrom: getValue(req.query.dateFrom),
        performanceDayTo: getValue(req.query.dateTo),
        eventStartFrom: getValue(req.query.eventStartFrom),
        eventStartThrough: getValue(req.query.eventStartThrough)
    };

    try {
        //Check the data transmitted to the server from the client
        const errorMessage = await validate(req);
        if (errorMessage !== '') {
            throw new Error(errorMessage);
        }

        // Get fields and fieldNames to output csv
        const csvPath = `${__dirname}/../configs/pos_sales.csv.yml`;
        const fileInfo = yaml.safeLoad(fs.readFileSync(csvPath, 'utf8'));

        // Get the sample data that satisfies the conditions contained in the sql server database
        let datas: IData[] = [];
        if (prmConditons.reportType == 'performance_day' || prmConditons.reportType == 'sales_date') {
            datas = await search4SalesDateOrPerformanceDay(prmConditons);
        }
        
        let fields: string[] = [];
        let fieldNames: string[] = [];
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
        res.end();
    } catch (error) {
        console.log(error);
    }
}

/**
 * Search for pos_sales in sql server
 * @param searchConditions 
 */
async function search4SalesDateOrPerformanceDay(searchConditions: any) {

    let sqlString: string = `SELECT * FROM pos_sales WHERE 1 = 1`;    
    sqlString = searchConditions.reportType == 'sales_date' ? createTime4SalesDate(sqlString, searchConditions) : createTime4PerformanceDay(sqlString, searchConditions);

    const pool = await new sql.ConnectionPool(configs.mssql).connect();
    const posSales: IData[] = await pool.request().query(sqlString).then(
        docs => docs.recordset.map(doc => <IData>(posSales2Data(<IPosSalesData>doc)))
    );
    debug(`${posSales.length} pos_sales found.`);
    return posSales;
}

/**
 * make search conditions for sales_date
 * @param sqlString 
 * @param searchConditions 
 */
function createTime4SalesDate(sqlString: string, searchConditions: ISearchSalesConditions): string {

    if (searchConditions.performanceDayFrom !== null || searchConditions.performanceDayTo !== null) {
        let salesDateConds: string[] = [];

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
function createTime4PerformanceDay(sqlString: string, searchConditions: ISearchSalesConditions): string {

    if (searchConditions.eventStartFrom !== null || searchConditions.eventStartThrough !== null) {
        let performanceDayConds: string[] = [];

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
function posSales2Data(r: IPosSalesData): IData {
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
function getValue(inputValue: string | null): string | null {
    return (!_.isEmpty(inputValue)) ? inputValue : null;
}

/**
 * Check the data transmitted to the server from the client
 * @param req 
 */
async function validate(req: Request): Promise<any> {

    const validatorResult = await req.getValidationResult();
    const errors: any = (!validatorResult.isEmpty()) ? validatorResult.mapped : {};

    if (req.query.dateFrom != null && isNaN(Date.parse(req.query.dateFrom))) {
        errors.dateFrom = { msg: '売上日付選択Fromが正しくない' };
    }

    if (req.query.dateTo != null && isNaN(Date.parse(req.query.dateTo))) {
        errors.dateTo = { msg: '売上日付選択Toが正しくない' };
    }

    if (req.query.eventStartFrom != null && isNaN(Date.parse(req.query.eventStartFrom))) {
        errors.eventStartFrom = { msg: '予約日付期間選択Fromが正しくない' };
    }

    if (req.query.eventStartThrough != null && isNaN(Date.parse(req.query.eventStartThrough))) {
        errors.eventStartThrough = { msg: '予約日付期間選択Toが正しくない' };
    }

    let errorMessage: string = '';
    Object.keys(errors).forEach((key) => {
        if (errorMessage !== '') { errorMessage += CSV_LINE_ENDING; }
        errorMessage += errors[key].msg;
    });

    return errorMessage;
}