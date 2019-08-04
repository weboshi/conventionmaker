import React from 'react'
import * as dates from 'date-arithmetic'
import { Calendar, Views, Navigate, momentLocalizer } from 'react-big-calendar'
import TimeGrid from 'react-big-calendar/lib/TimeGrid'
import moment from 'moment'


const localizer = momentLocalizer(moment)
const bloop = [{title: 'hi'}]


class MyWeek extends React.Component {
    render() {
    console.log(this.props)
      let { date } = this.props
      let rn = this.props.days
      let range = MyWeek.range(date, rn)
  
      return <TimeGrid {...this.props} range={range} eventOffset={15} />
    }
  }
  
  MyWeek.range = (date, rn) => {
    let start = date
    let rng = rn
    console.log(rn)
    let end = dates.add(start, rng, 'day')
  
    let current = start
    let range = []
  
    while (dates.lte(current, end, 'day')) {
      range.push(current)
      current = dates.add(current, 1, 'day')
    }
    console.log(range)
  
    return range
  }
  
  MyWeek.navigate = (date, action) => {
    switch (action) {
      case Navigate.PREVIOUS:
        return dates.add(date, -3, 'day')
  
      case Navigate.NEXT:
        return dates.add(date, 3, 'day')
  
      default:
        return date
    }
  }
  
  MyWeek.title = () => {
    return "hello"
  }
  
  let CustomView = (props) => (
    <React.Fragment>
      <Calendar
        days={props.range}
        events={props.myEventsList}
        localizer={localizer}
        defaultView={Views.WEEK}
        defaultDate={new Date(props.date)}
        views={{ day: true, week: MyWeek }}
      />
    </React.Fragment>
  )
  
  export default CustomView