type SheetsOpt = Array<XlsxBook>

interface Sheets {
    [key: string]: Sheet
}

interface Sheet {
    name: string,
    columns?: Columns,
    colAoa?: Aoa,
    colMerge?: Merge,
    flatProps?: flatProps
    data?: Data,
    dataAoa?: Aoa,
    dataMerge?: Merge
}

type Columns = Array<Column>
interface Column {
    label?: string,
    prop?: string,
    children?: Columns,
    s?: CellStyle
}


interface XlsxBook {
    sheetName?: string,
    columns: Columns,
    data: Data,
    merge: Array<string>
}


type Data = Array<{ [key: string]: any }>


type Aoa = Array<RowsCell>
type RowsCell = Array<CellObject | any>

type Merges = Array<Range>
type flatProps = Array<string | null>






// CellObject

