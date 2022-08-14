import Button from "@components/Button";
import { Checkbox, Select, Text } from "@components/Inputs";
import PopupWindowContainer from "@components/PopupWindowContainer/PopupWindowContainer"
import { Tab, TabView } from "@components/TabView/TabView";
import { FC } from "react"
import { useForm , SubmitHandler, FieldValues, Controller} from "react-hook-form";
import styles from './FilePropsForm.module.scss'

type Props= {
}

const FilePropsForm: FC<Props> = () => {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm();
    const onSubmit: SubmitHandler<FieldValues> = data => console.log(data);

    
    return (
        <div className={styles.container}>        
            <h4>File Properties</h4>
            <TabView>
                <Tab name="Properties">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Controller
                            name="fileType"
                            control={control}
                            render={({ field }) => <Select 
                                {...field} 
                                label="File type"
                                options={[]} 
                                />}
                        />
                        <Controller
                            name="separator"
                            control={control}
                            render={({ field }) => <Select 
                                {...field} 
                                label="Separator"
                                options={[]} 
                                />}
                        />
                        <Checkbox label="Has header row" {...register("hasHeader")} />
                        <Controller
                            name="itemsetFormat"
                            control={control}
                            render={({ field }) => <Select 
                                {...field} 
                                label="Itemset format"
                                options={[]} 
                                />}
                        />
                        <div className={styles.fieldsRow}>
                            <Text label="ID column index" {...register("idIndex")} />
                            <Text label="Itemset column index" {...register("itemsetIndex")} />
                        </div>
                        <div className={styles.buttonsRow}> 
                            <Button variant="secondary">Cancel</Button>    
                            <Button variant="primary">Save</Button> 
                        </div>   
                    </form>
                </Tab>
                <Tab name="Statistics"><div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 256}}>Statistics are not available yet</div></Tab>
            </TabView>
        </div>
    
    )
}

export default FilePropsForm