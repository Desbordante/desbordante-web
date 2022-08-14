import { FC, useState } from "react"
import { useForm , SubmitHandler, FieldValues, Controller} from "react-hook-form";
import Button from "@components/Button";
import { Checkbox, Select, Text } from "@components/Inputs";
import { Tab, TabView } from "@components/TabView/TabView";
import { FileProps } from "types/globalTypes";
import styles from './FilePropsView.module.scss'

type Props = {
    data: FileProps,
}

type FormProps = {
    onEdit?: () => void
}

const FilePropsList: FC<Props & FormProps> = ({data, onEdit}) => {
    return <>
        <div className={styles.propsList}>
            <div><p>File type</p><p>{data.fileType || 'CSV'}</p></div>
            <div><p>Separator</p><p>{data.delimiter}</p></div>
            <div><p>Has header row</p><p>{data.hasHeader ? 'Yes' : 'No'}</p></div>
            <div><p>Itemset format</p><p>{data.inputFormat}</p></div>
            <div><p>ID column index</p><p>{data.tidColumnIndex}</p></div>
            <div><p>Itemset column index</p><p>{data.itemColumnIndex}</p></div>
        </div>
        <div className={styles.buttonsRow}>
            <Button variant="secondary" >Delete</Button>    
            <Button variant="primary" onClick={onEdit}>Edit</Button> 
        </div>
    </>
}

const FilePropsForm: FC<Props & FormProps> = ({data, onEdit}) => {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm({defaultValues: data});
    const onSubmit: SubmitHandler<FieldValues> = data => onEdit && onEdit()

    return <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name={"fileType"}
                control={control}
                render={({ field }) => <Select 
                    {...field} 
                    label="File type"
                    options={[{"value": "CSV", "label": "CSV"}]} 
                    />}
            />
            <Controller
                name="delimiter"
                control={control}
                render={({ field }) => <Select 
                    {...field} 
                    label="Separator"
                    options={[{"value": ",", "label": "Comma (\",\")"}]} 
                    />}
            />
            <Checkbox label="Has header row" {...register("hasHeader")} />
            <Controller
                name="inputFormat"
                control={control}
                render={({ field }) => <Select 
                    {...field} 
                    label="Itemset format"
                    options={[
                        {value: "SINGULAR", label: "Singular"},
                        {value: "TABULAR", label: "Tabular"},
                    ]} 
                    />}
            />
            <div className={styles.fieldsRow}>
                <Text label="ID column index" {...register("tidColumnIndex")} />
                <Text label="Itemset column index" {...register("itemColumnIndex")} />
            </div>
            <div className={styles.buttonsRow}> 
                <Button variant="secondary">Cancel</Button>    
                <Button variant="primary" onClick={handleSubmit(onSubmit)}>Save</Button> 
            </div>   
    </form>
}
const FilePropsView: FC<Props> = ({data}) => {
    const [isEdited, setIsEdited] = useState(false)
    return (
        <div className={styles.container}>        
            <h4>File Properties</h4>
            <TabView>
                <Tab name="Properties">
                    {!isEdited && <FilePropsList onEdit={() => setIsEdited(true)} data={data} />}
                    {isEdited && <FilePropsForm onEdit={() => setIsEdited(false)} data={data} />}
                </Tab>
                <Tab name="Statistics"><div className={styles.stats}><p>Statistics are not available yet</p></div></Tab>
            </TabView>
        </div>
    
    )
}

export default FilePropsView