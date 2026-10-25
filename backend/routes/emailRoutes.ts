import {Router, Request, Response} from "express";
const router=Router();

type ScheduledEmail = {
    id:string;
    email:string;
    subject:string;
    body:string;
    scheduleAt:string;
    status:"scheduled";
}

const emails:ScheduledEmail[]=[]

router.post("/schedule",(req:Request,res:Response)=>{
    const {recipients, subject, body, startTime, delay}=req.body;
    if(!Array.isArray(recipients) || recipients.length==0 ||
        !subject?.trim() || !body?.trim() || !startTime){
            return res.status(400).json({
                success:false,
                message:"Recipients, subject, body and start time are required."
            });
    }
    const start=new Date(startTime);
    if(Number.isNaN(start.getTime()) || start.getTime()<=Date.now()){
        return res.status(400).json({
            success:false,
            message:"Start time must be a valid future date"
        });
    }
    const delaySeconds=Math.max(2,Number(delay)||2);
    const created = recipients.map((email:string,index:number)=>{
        const record: ScheduledEmail = {
            id: `${Date.now()}-${index}`,
            email,
            subject:subject.trim(),
            body:body.trim(),
            scheduleAt:new Date(
                start.getTime()+index*delaySeconds*1000
            ).toISOString(),
            status:"scheduled"
        };
        emails.push(record);
        return record;
    });
    return res.status(201).json({
        message:"Emails accepted for scheduling",
        count: created.length,
        emails: created
    });
});

router.get('/',(req:Request,res:Response)=>{
    res.json({emails});
})

export default router;