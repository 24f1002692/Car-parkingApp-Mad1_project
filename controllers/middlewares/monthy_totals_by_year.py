from collections import defaultdict
import calendar

def get_monthly_totals_by_year(reservations, selected_year):
    month_totals = defaultdict(float)
    for res in reservations:
        if res['year'] == selected_year:
            month_totals[res['month']] += res['bill_amount']

       # get the amount spend in month m

    return {'labels': labels, 'data': data}
