'use client';
import {useCallback,useEffect,useState} from 'react';
import {Alert,Button,Table,Tag,Typography} from 'antd';
type Notification={id:string;template:string;recipient_email:string;status:string;delivery_status:string|null;requires_review:boolean;attempts:number;last_error:string|null;created_at:string;sent_at:string|null};
export default function NotificationsPage(){
 const [rows,setRows]=useState<Notification[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 const load=useCallback(async()=>{setLoading(true);try{const response=await fetch('/api/admin/notifications',{cache:'no-store'});const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to load notifications');setRows(result.notifications);setError('');}catch(e){setError(e instanceof Error?e.message:'Unable to load notifications');}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();},[load]);
 return <section><Typography.Title level={2}>Customer notifications</Typography.Title><Typography.Paragraph>Submission confirms the email provider accepted the message. Delivery and bounce status are checked separately. Uncertain or stale messages require review and are not automatically resent.</Typography.Paragraph><Button onClick={()=>void load()} loading={loading}>Refresh</Button>{error&&<Alert type="error" title={error}/>}<Table<Notification> rowKey="id" loading={loading} dataSource={rows} scroll={{x:1000}} pagination={{pageSize:20}} columns={[
 {title:'Created',dataIndex:'created_at',render:(value:string)=>new Date(value).toLocaleString()},
 {title:'Recipient',dataIndex:'recipient_email'}, {title:'Notification',dataIndex:'template'},
 {title:'Submission',dataIndex:'status'}, {title:'Delivery',dataIndex:'delivery_status',render:(value:string|null)=>value||'Not verified'},
 {title:'Attempts',dataIndex:'attempts'}, {title:'Action',dataIndex:'requires_review',render:(value:boolean)=>value?<Tag color="warning">Operator review</Tag>:null},
 {title:'Details',dataIndex:'last_error',render:(value:string|null)=>value||'—'},
 ]}/></section>;
}
