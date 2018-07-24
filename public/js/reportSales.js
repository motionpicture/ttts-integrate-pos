$(function () {
    // datepickerセット
    $('.datepicker').datepicker({
        language: 'ja'
    });

    // レポート出力ボタンイベント
    $(document).on('click', '.form-salesReportByTransactionEndDate .btn-download', function () {
        var form = $('.form-salesReportByTransactionEndDate');
        var dateFrom = $('input[name="dateFrom"]', form).val();
        var dateTo = $('input[name="dateTo"]', form).val();

        // レポート区分
        var reportType = $('input[name="reportType"]', form).val();
        // now:キャッシュ避け
        var now = (new Date()).getTime();
        var url = '/reports/getSales/' +
            '?dateFrom=' + dateFrom + '&dateTo=' + dateTo +
            '&reportType=' + reportType + '&dummy=' + now;
        console.log('[donwload] sales report', url);
        window.open(url);
    });

    // 来塔予定日ごとの売り上げレポート出力ボタンイベント
    $(document).on('click', '.form-salesReportByEventStartDate .btn-download', function () {
        var form = $('.form-salesReportByEventStartDate');
        var eventStartFrom = $('input[name="eventStartFrom"]', form).val();
        var eventStartThrough = $('input[name="eventStartThrough"]', form).val();
        var reportType = $('input[name="reportType"]', form).val();

        // now:キャッシュ避け
        var now = (new Date()).getTime();
        var url = '/reports/getSales/' +
            '?eventStartFrom=' + eventStartFrom + '&eventStartThrough=' + eventStartThrough +
            '&reportType=' + reportType + '&dummy=' + now;
        console.log('[donwload] salesReportByEventStartDate', url);
        window.open(url);
    });
});
