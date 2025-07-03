import io
import markdown
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, grey
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
import re
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from typing import Optional
from . import crud
from .models import Summary, Meeting


class PDFService:
    """Service for generating PDF documents from meeting summaries using ReportLab"""
    
    def __init__(self):
        # Custom colors
        self.primary_color = HexColor('#3b82f6')  # Blue
        self.secondary_color = HexColor('#1e40af')  # Dark blue
        self.text_color = HexColor('#374151')  # Dark gray
        self.light_gray = HexColor('#f8fafc')  # Light gray
        
        # Get base styles
        self.styles = getSampleStyleSheet()
        
        # Create custom styles
        self.create_custom_styles()
    
    def create_custom_styles(self):
        """Create custom paragraph styles"""
        
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=self.secondary_color,
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Company header style
        self.styles.add(ParagraphStyle(
            name='CompanyHeader',
            parent=self.styles['Normal'],
            fontSize=28,
            textColor=self.primary_color,
            spaceAfter=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=self.secondary_color,
            spaceBefore=20,
            spaceAfter=10,
            fontName='Helvetica-Bold'
        ))
        
        # Content style
        self.styles.add(ParagraphStyle(
            name='ContentText',
            parent=self.styles['Normal'],
            fontSize=11,
            textColor=self.text_color,
            spaceAfter=8,
            firstLineIndent=0
        ))
    
    async def generate_summary_pdf(
        self, 
        db: AsyncSession, 
        summary_id: str, 
        user_id: str
    ) -> Optional[bytes]:
        """Generate PDF from meeting summary"""
        try:
            # Get summary
            summary = await crud.get_summary_by_id(db, summary_id, user_id)
            if not summary:
                raise ValueError("Summary not found")
            
            # Get meeting details
            meeting = await crud.get_meeting_by_id(db, summary.meeting_id, user_id)
            if not meeting:
                raise ValueError("Meeting not found")
            
            # Generate PDF content
            pdf_buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                pdf_buffer,
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            
            # Build PDF content
            story = self._build_pdf_content(summary, meeting)
            doc.build(story)
            
            return pdf_buffer.getvalue()
            
        except Exception as e:
            print(f"❌ Error generating PDF: {str(e)}")
            return None
    
    async def generate_meeting_pdf(
        self, 
        db: AsyncSession, 
        meeting_id: str, 
        user_id: str
    ) -> Optional[bytes]:
        """Generate PDF from meeting summary (latest summary for meeting)"""
        try:
            # Get latest summary for the meeting
            summaries = await crud.get_summaries_by_meeting(db, meeting_id, user_id)
            if not summaries:
                raise ValueError("No summaries found for this meeting")
            
            summary = summaries[0]  # Latest summary
            
            # Get meeting details
            meeting = await crud.get_meeting_by_id(db, meeting_id, user_id)
            if not meeting:
                raise ValueError("Meeting not found")
            
            # Generate PDF content
            pdf_buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                pdf_buffer,
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=72
            )
            
            # Build PDF content
            story = self._build_pdf_content(summary, meeting)
            doc.build(story)
            
            return pdf_buffer.getvalue()
            
        except Exception as e:
            print(f"❌ Error generating meeting PDF: {str(e)}")
            return None
    
    def _build_pdf_content(self, summary: Summary, meeting: Meeting) -> list:
        """Build PDF content as a list of flowables"""
        story = []
        
        # Header with company name
        story.append(Paragraph("🎯 AfterTalk", self.styles['CompanyHeader']))
        story.append(Spacer(1, 20))
        
        # Title
        story.append(Paragraph("Meeting Summary Report", self.styles['CustomTitle']))
        story.append(Spacer(1, 30))
        
        # Meeting information table
        meeting_info_data = self._create_meeting_info_table(summary, meeting)
        meeting_table = Table(meeting_info_data, colWidths=[2*inch, 3*inch])
        meeting_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.light_gray),
            ('TEXTCOLOR', (0, 0), (-1, 0), self.secondary_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, grey),
        ]))
        
        story.append(meeting_table)
        story.append(Spacer(1, 20))
        
        # Summary content
        story.append(Paragraph("📋 Summary Content", self.styles['SectionHeader']))
        story.append(Spacer(1, 10))
        
        # Convert markdown to paragraphs
        content_paragraphs = self._convert_markdown_to_paragraphs(summary.content)
        for paragraph in content_paragraphs:
            story.append(paragraph)
        
        # Footer
        story.append(Spacer(1, 30))
        footer_text = f"Generated by AfterTalk on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
        story.append(Paragraph(footer_text, self.styles['Normal']))
        
        return story
    
    def _create_meeting_info_table(self, summary: Summary, meeting: Meeting) -> list:
        """Create meeting information table data"""
        # Format dates
        created_date = meeting.created_at.strftime("%B %d, %Y") if meeting.created_at else "N/A"
        
        # Calculate duration
        duration = "N/A"
        if meeting.started_at and meeting.ended_at:
            duration_delta = meeting.ended_at - meeting.started_at
            hours = int(duration_delta.total_seconds() // 3600)
            minutes = int((duration_delta.total_seconds() % 3600) // 60)
            duration = f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"
        
        return [
            ["Meeting Information", ""],
            ["Platform", meeting.meeting_platform.replace('_', ' ').title()],
            ["Status", meeting.status.title()],
            ["Created", created_date],
            ["Duration", duration],
            ["Word Count", str(summary.word_count)],
            ["Reading Time", f"{summary.reading_time_minutes} minutes"],
        ]
    
    def _convert_markdown_to_paragraphs(self, markdown_content: str) -> list:
        """Convert markdown content to ReportLab paragraphs"""
        paragraphs = []
        
        # Split content by lines
        lines = markdown_content.split('\n')
        current_paragraph = ""
        
        for line in lines:
            line = line.strip()
            
            if not line:
                # Empty line - end current paragraph
                if current_paragraph:
                    paragraphs.append(Paragraph(current_paragraph, self.styles['ContentText']))
                    current_paragraph = ""
                paragraphs.append(Spacer(1, 6))
                continue
            
            # Handle headers
            if line.startswith('# '):
                if current_paragraph:
                    paragraphs.append(Paragraph(current_paragraph, self.styles['ContentText']))
                    current_paragraph = ""
                header_text = line[2:].strip()
                paragraphs.append(Paragraph(header_text, self.styles['SectionHeader']))
                paragraphs.append(Spacer(1, 10))
                continue
            
            if line.startswith('## '):
                if current_paragraph:
                    paragraphs.append(Paragraph(current_paragraph, self.styles['ContentText']))
                    current_paragraph = ""
                header_text = line[3:].strip()
                paragraphs.append(Paragraph(header_text, self.styles['SectionHeader']))
                paragraphs.append(Spacer(1, 8))
                continue
            
            # Handle bullet points
            if line.startswith('- ') or line.startswith('* '):
                if current_paragraph:
                    paragraphs.append(Paragraph(current_paragraph, self.styles['ContentText']))
                    current_paragraph = ""
                bullet_text = line[2:].strip()
                bullet_text = self._format_text(bullet_text)
                bullet_style = ParagraphStyle(
                    name='BulletText',
                    parent=self.styles['ContentText'],
                    leftIndent=20,
                    bulletIndent=10
                )
                paragraphs.append(Paragraph(f"• {bullet_text}", bullet_style))
                continue
            
            # Regular text
            if current_paragraph:
                current_paragraph += " " + self._format_text(line)
            else:
                current_paragraph = self._format_text(line)
        
        # Add final paragraph if exists
        if current_paragraph:
            paragraphs.append(Paragraph(current_paragraph, self.styles['ContentText']))
        
        return paragraphs
    
    def _format_text(self, text: str) -> str:
        """Format text for ReportLab (handle bold, etc.)"""
        # Replace markdown bold with ReportLab bold
        text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
        text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
        
        # Handle special characters
        text = text.replace('&', '&amp;')
        text = text.replace('<', '&lt;').replace('>', '&gt;')
        
        # Restore formatted tags
        text = text.replace('&lt;b&gt;', '<b>').replace('&lt;/b&gt;', '</b>')
        text = text.replace('&lt;i&gt;', '<i>').replace('&lt;/i&gt;', '</i>')
        
        return text
    
    def get_pdf_filename(self, summary: Summary, meeting: Meeting) -> str:
        """Generate appropriate filename for PDF"""
        # Clean title for filename
        clean_title = "".join(c for c in summary.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        clean_title = clean_title.replace(' ', '_')
        
        # Add date
        date_str = meeting.created_at.strftime("%Y%m%d") if meeting.created_at else "unknown"
        
        return f"meeting_summary_{clean_title}_{date_str}.pdf"


# Create service instance
pdf_service = PDFService() 