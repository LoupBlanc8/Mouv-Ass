import PyPDF2

def extract_text_from_pdf(pdf_path, txt_path):
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page_num in range(len(reader.pages)):
            text += reader.pages[page_num].extract_text()
            
    with open(txt_path, 'w', encoding='utf-8') as file:
        file.write(text)

extract_text_from_pdf('street workout documentation.pdf', 'doc_street_workout_extract.txt')
print("Successfully extracted PDF")
