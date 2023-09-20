interface a {
    a: string
}

// ts Array emtyp type?
type Aoa = Array<[undefined] | [string] | undefined>

type Columns = Array<Column>

type Data = Array<{[key:string]: any}>

type Merge = Array<Range>

interface Column {
    label?: string,
    prop?: string,
    children?: Columns,
    s?: CellStyle
}

// CellObject