import moment from 'moment';

class CreateNotificationRequest {
  constructor({ Sender, Target, Title, Text, Icon, ActionTitle, RedirectUrl, Date, IsRead }) {
    this.Sender = Sender;
    this.Target = Target;
    this.Title = Title;
    this.Text = Text;
    this.Icon = Icon;
    this.ActionTitle = ActionTitle;
    this.RedirectUrl = RedirectUrl;
    this.Date = Date;
    this.IsRead = IsRead;

  }

  static StudentRegistrationBody(Target, StudentData) {
    return new CreateNotificationRequest({
      Sender: 0,
      Target: Target,
      Title: "Siswa Baru",
      Text: "Siswa baru atas nama " + StudentData.StudentName + " telah mendaftar",
      Icon: "mdi-account-child",
      ActionTitle: "Lihat Detail Siswa",
      RedirectUrl: "/backoffice/siswa/" + StudentData.StudentID,
      Date: new Date(),
      IsRead: false
    });
  }

  static TutorRegistrationBody(Target, TutorData) {
    return new CreateNotificationRequest({
      Sender: 0,
      Target: Target,
      Title: "Tutor Baru",
      Text: "Tutor baru atas nama " + TutorData.TutorName + " telah mendaftar",
      Icon: "mdi-account-tie",
      ActionTitle: "Lihat Detail Tutor",
      RedirectUrl: "/backoffice/tutor/" + TutorData.TutorID,
      Date: new Date(),
      IsRead: false
    });
  }

  static InvoiceBody(InvoiceData, StudentData) {
    return new CreateNotificationRequest({
      Sender: 0,
      Target: StudentData.UserID,
      Title: "Invoice",
      Text: `Invoice siswa ${StudentData.StudentName} untuk periode ${moment(InvoiceData.StartDate).format("D MMM YYYY")} hingga ${moment(InvoiceData.EndDate).format("D MMM YYYY")} telah diterbitkan` ,
      Icon: "mdi-receipt-text-check-outline",
      ActionTitle: "Lihat Rincian Invoice",
      RedirectUrl: "/document/invoice/" + InvoiceData.UniquePath,
      Date: new Date(),
      IsRead: false
    });
  }

  static FeeBody(FeeData) {
    return new CreateNotificationRequest({
      Sender: 0,
      Target: FeeData.TutorDetail.UserID,
      Title: "Slip Gaji",
      Text: `Slip gaji tutor ${FeeData.TutorDetail.Name} untuk periode ${moment(FeeData.StartDate).format("D MMM YYYY")} hingga ${moment(FeeData.EndDate).format("D MMM YYYY")} telah diterbitkan` ,
      Icon: "mdi-receipt-text-check-outline",
      ActionTitle: "Lihat Rincian Slip Gaji",
      RedirectUrl: "/document/fee/" + FeeData.UniquePath,
      Date: new Date(),
      IsRead: false
    });
  }
}

export default CreateNotificationRequest;
